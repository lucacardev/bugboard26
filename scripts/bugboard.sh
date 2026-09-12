#!/usr/bin/env bash
# Gestore unico degli ambienti BugBoard26.
#
# Uso:
#   ./scripts/bugboard.sh <dev|prod|aws> <azione> [argomenti]
#
# Esempi:
#   ./scripts/bugboard.sh dev up
#   ./scripts/bugboard.sh dev test
#   ./scripts/bugboard.sh prod migrate
#   ./scripts/bugboard.sh aws deploy
#   ./scripts/bugboard.sh aws logs backend --follow
#
# Ambiente "dev":
#   docker-compose.yml + docker-compose.dev.yml
#
# Ambiente "prod":
#   docker-compose.yml + docker-compose.prod.yml
#
# Ambiente "aws":
#   docker-compose.yml + docker-compose.prod.yml + docker-compose.https.yml

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

MODE="${1:-}"
ACTION="${2:-help}"
ARG1="${3:-}"
ARG2="${4:-}"

usage() {
  cat <<'EOF'
BugBoard26 - gestione ambienti

Uso:
  ./scripts/bugboard.sh <dev|prod|aws> <azione> [argomenti]

Ambienti:
  dev     sviluppo Docker con hot reload
  prod    build produzione in locale
  aws     deploy produzione HTTPS su AWS

Azioni:
  up                    avvia/aggiorna i container con --build
  start                 alias di up
  rebuild [servizio]    ricostruisce tutto o un singolo servizio
  migrate               esegue migration + seed admin
  test                  esegue i test Jest (solo dev)
  coverage              esegue i test Jest con coverage (solo dev)
  build-check           compila backend e frontend (solo dev)
  status                mostra lo stato dei container
  logs [servizio]       mostra le ultime 150 righe dei log
  logs [servizio] --follow
                        segue i log in tempo reale
  restart [servizio]    riavvia tutto o un singolo servizio
  stop                  ferma l'ambiente senza cancellare i dati
  backup                crea un dump PostgreSQL nella cartella backups/
  db                    apre psql dentro PostgreSQL
  redis                 apre redis-cli
  reset                 cancella i volumi locali (vietato in modalità aws)
  pull                  git pull --ff-only (solo aws)
  deploy                backup + git pull + rebuild + migrate + status (solo aws)
  help                  mostra questo messaggio

Esempi:
  ./scripts/bugboard.sh dev up
  ./scripts/bugboard.sh dev migrate
  ./scripts/bugboard.sh dev test
  ./scripts/bugboard.sh dev logs backend --follow

  ./scripts/bugboard.sh aws status
  ./scripts/bugboard.sh aws migrate
  ./scripts/bugboard.sh aws logs worker --follow
  ./scripts/bugboard.sh aws deploy
EOF
}

if [[ -z "$MODE" || "$MODE" == "-h" || "$MODE" == "--help" || "$MODE" == "help" ]]; then
  usage
  exit 0
fi

case "$MODE" in
  dev)
    COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.dev.yml)
    ;;
  prod)
    COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)
    ;;
  aws)
    COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml)
    ;;
  *)
    echo "Errore: ambiente non valido: $MODE"
    echo
    usage
    exit 2
    ;;
esac

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Errore: comando '$1' non trovato."
    exit 1
  fi
}

check_docker() {
  require_command docker
  if ! docker info >/dev/null 2>&1; then
    echo "Errore: Docker non è avviato o l'utente corrente non può usarlo."
    exit 1
  fi
}

check_env_files() {
  if [[ ! -f backend/.env ]]; then
    echo "Errore: backend/.env non esiste."
    echo "Crealo a partire da backend/.env.example prima di avviare BugBoard26."
    exit 1
  fi

  if [[ "$MODE" == "prod" || "$MODE" == "aws" ]]; then
    if [[ ! -f .env ]]; then
      echo "Attenzione: .env nella root non esiste."
      echo "Docker userà il fallback POSTGRES_PASSWORD=postgres."
      if [[ "$MODE" == "aws" ]]; then
        echo "In AWS è fortemente consigliato creare .env con POSTGRES_PASSWORD."
        exit 1
      fi
    fi
  fi
}

service_running() {
  local service="$1"
  local cid
  cid="$("${COMPOSE[@]}" ps -q "$service" 2>/dev/null || true)"
  [[ -n "$cid" ]] && [[ "$(docker inspect -f '{{.State.Running}}' "$cid" 2>/dev/null || true)" == "true" ]]
}

wait_for_service() {
  local service="$1"
  local attempts="${2:-30}"

  echo "Attendo che il servizio '$service' sia in esecuzione..."
  for ((i=1; i<=attempts; i++)); do
    if service_running "$service"; then
      echo "Servizio '$service' attivo."
      return 0
    fi
    sleep 2
  done

  echo "Errore: '$service' non risulta attivo."
  "${COMPOSE[@]}" logs --tail=100 "$service" || true
  return 1
}

do_up() {
  check_docker
  check_env_files
  echo "Avvio ambiente '$MODE'..."
  "${COMPOSE[@]}" up -d --build
  echo
  "${COMPOSE[@]}" ps
}

do_rebuild() {
  check_docker
  check_env_files

  if [[ -n "$ARG1" ]]; then
    echo "Ricostruzione servizio '$ARG1' nell'ambiente '$MODE'..."
    "${COMPOSE[@]}" up -d --build "$ARG1"
  else
    echo "Ricostruzione completa dell'ambiente '$MODE'..."
    "${COMPOSE[@]}" up -d --build
  fi

  "${COMPOSE[@]}" ps
}

do_migrate() {
  check_docker
  check_env_files

  if ! service_running backend; then
    echo "Errore: il backend non è in esecuzione."
    echo "Avvialo prima con:"
    echo "  ./scripts/bugboard.sh $MODE up"
    exit 1
  fi

  echo "Esecuzione migration Sequelize..."
  "${COMPOSE[@]}" exec -T backend npx sequelize-cli db:migrate

  echo
  echo "Verifica/creazione admin di default..."
  if [[ "$MODE" == "dev" ]]; then
    "${COMPOSE[@]}" exec -T backend npm run seed:admin:dev
  else
    "${COMPOSE[@]}" exec -T backend npm run seed:admin
  fi

  echo
  echo "Migration e seed completati."
}

do_test() {
  if [[ "$MODE" != "dev" ]]; then
    echo "Errore: i test automatici vanno eseguiti nell'ambiente dev."
    echo "Usa:"
    echo "  ./scripts/bugboard.sh dev test"
    exit 1
  fi

  check_docker
  if ! service_running backend; then
    echo "Errore: backend dev non attivo."
    exit 1
  fi

  "${COMPOSE[@]}" exec -T backend npm test -- --runInBand
}

do_coverage() {
  if [[ "$MODE" != "dev" ]]; then
    echo "Errore: la coverage va eseguita nell'ambiente dev."
    exit 1
  fi

  check_docker
  if ! service_running backend; then
    echo "Errore: backend dev non attivo."
    exit 1
  fi

  "${COMPOSE[@]}" exec -T backend npm test -- --coverage --runInBand
}

do_build_check() {
  if [[ "$MODE" != "dev" ]]; then
    echo "Errore: build-check usa i container dev."
    echo "Usa:"
    echo "  ./scripts/bugboard.sh dev build-check"
    exit 1
  fi

  check_docker

  if ! service_running backend || ! service_running frontend; then
    echo "Errore: backend e frontend dev devono essere attivi."
    exit 1
  fi

  echo "Compilazione backend..."
  "${COMPOSE[@]}" exec -T backend npm run build

  echo
  echo "Compilazione frontend..."
  "${COMPOSE[@]}" exec -T frontend npm run build

  echo
  echo "Build-check completato con successo."
}

do_status() {
  check_docker
  "${COMPOSE[@]}" ps
}

do_logs() {
  check_docker

  local service="$ARG1"
  local follow="$ARG2"

  if [[ "$service" == "--follow" || "$service" == "-f" ]]; then
    follow="$service"
    service=""
  fi

  if [[ "$follow" == "--follow" || "$follow" == "-f" ]]; then
    if [[ -n "$service" ]]; then
      "${COMPOSE[@]}" logs --tail=150 -f "$service"
    else
      "${COMPOSE[@]}" logs --tail=150 -f
    fi
  else
    if [[ -n "$service" ]]; then
      "${COMPOSE[@]}" logs --tail=150 "$service"
    else
      "${COMPOSE[@]}" logs --tail=150
    fi
  fi
}

do_restart() {
  check_docker

  if [[ -n "$ARG1" ]]; then
    "${COMPOSE[@]}" restart "$ARG1"
  else
    "${COMPOSE[@]}" restart
  fi

  "${COMPOSE[@]}" ps
}

do_stop() {
  check_docker
  echo "Arresto ambiente '$MODE' senza cancellare i volumi..."
  "${COMPOSE[@]}" down --remove-orphans
}

do_backup() {
  check_docker

  if ! service_running postgres; then
    echo "Errore: PostgreSQL non è in esecuzione; backup non eseguibile."
    exit 1
  fi

  mkdir -p backups
  local timestamp
  timestamp="$(date '+%Y%m%d_%H%M%S')"
  local file="backups/bugboard26_${MODE}_${timestamp}.sql"

  echo "Creazione backup PostgreSQL: $file"
  "${COMPOSE[@]}" exec -T postgres pg_dump -U postgres -d bugboard26 > "$file"

  if [[ ! -s "$file" ]]; then
    echo "Errore: il file di backup è vuoto."
    rm -f "$file"
    exit 1
  fi

  echo "Backup completato: $file"
}

do_db() {
  check_docker
  if ! service_running postgres; then
    echo "Errore: PostgreSQL non è in esecuzione."
    exit 1
  fi
  "${COMPOSE[@]}" exec postgres psql -U postgres -d bugboard26
}

do_redis() {
  check_docker
  if ! service_running redis; then
    echo "Errore: Redis non è in esecuzione."
    exit 1
  fi
  "${COMPOSE[@]}" exec redis redis-cli
}

do_reset() {
  if [[ "$MODE" == "aws" ]]; then
    echo "OPERAZIONE BLOCCATA."
    echo "Lo script non consente di cancellare automaticamente i volumi AWS."
    echo "Se devi realmente azzerare il database di produzione, fallo manualmente e solo dopo un backup."
    exit 1
  fi

  check_docker

  echo "ATTENZIONE: verranno eliminati Postgres e Redis locali."
  read -r -p "Continuare? Scrivi RESET per confermare: " conferma
  if [[ "$conferma" != "RESET" ]]; then
    echo "Annullato."
    exit 0
  fi

  # Dev e prod condividono gli stessi volumi della root del progetto.
  docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans || true
  docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans || true

  echo "Reset completato."
  echo "Al prossimo avvio esegui:"
  echo "  ./scripts/bugboard.sh dev up"
  echo "  ./scripts/bugboard.sh dev migrate"
}

ensure_git_clean() {
  require_command git

  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Errore: sulla macchina AWS ci sono modifiche Git non committate."
    echo "Per sicurezza il deploy automatico viene interrotto."
    echo
    git status --short
    exit 1
  fi

  # Anche i file non tracciati possono indicare modifiche manuali,
  # ma .env e backup normalmente sono esclusi da Git.
  local untracked
  untracked="$(git ls-files --others --exclude-standard)"
  if [[ -n "$untracked" ]]; then
    echo "Attenzione: sono presenti file non tracciati:"
    echo "$untracked"
    echo
    echo "Il deploy prosegue perché potrebbero essere file locali intenzionali."
  fi
}

do_pull() {
  if [[ "$MODE" != "aws" ]]; then
    echo "Errore: l'azione pull automatica è prevista soltanto per aws."
    exit 1
  fi

  ensure_git_clean

  echo "Aggiornamento repository..."
  git pull --ff-only
}

do_deploy() {
  if [[ "$MODE" != "aws" ]]; then
    echo "Errore: deploy è disponibile soltanto in modalità aws."
    exit 1
  fi

  check_docker
  check_env_files
  ensure_git_clean

  echo "=== 1/5 Backup database ==="
  if service_running postgres; then
    do_backup
  else
    echo "PostgreSQL non è attivo: backup pre-deploy saltato."
  fi

  echo
  echo "=== 2/5 Git pull ==="
  git pull --ff-only

  echo
  echo "=== 3/5 Build e avvio container ==="
  "${COMPOSE[@]}" up -d --build

  echo
  echo "=== 4/5 Verifica backend e migration ==="
  wait_for_service backend
  # Il Dockerfile di produzione esegue già le migration nell'entrypoint.
  # La chiamata esplicita è intenzionalmente idempotente: verifica che lo
  # schema sia realmente aggiornato e rende il deploy auto-documentante.
  do_migrate

  echo
  echo "=== 5/5 Stato finale ==="
  "${COMPOSE[@]}" ps

  echo
  echo "Deploy AWS completato."
  echo "Per controllare i log:"
  echo "  ./scripts/logs.sh aws backend"
  echo "  ./scripts/logs.sh aws worker"
  echo "  ./scripts/logs.sh aws frontend"
}

case "$ACTION" in
  up|start)
    do_up
    ;;
  rebuild)
    do_rebuild
    ;;
  migrate)
    do_migrate
    ;;
  test)
    do_test
    ;;
  coverage)
    do_coverage
    ;;
  build-check)
    do_build_check
    ;;
  status|ps)
    do_status
    ;;
  logs)
    do_logs
    ;;
  restart)
    do_restart
    ;;
  stop|down)
    do_stop
    ;;
  backup)
    do_backup
    ;;
  db)
    do_db
    ;;
  redis)
    do_redis
    ;;
  reset)
    do_reset
    ;;
  pull)
    do_pull
    ;;
  deploy|update)
    do_deploy
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Errore: azione non valida: $ACTION"
    echo
    usage
    exit 2
    ;;
esac
