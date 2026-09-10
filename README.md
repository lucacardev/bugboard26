# BugBoard26

Piattaforma di issue tracking multi-progetto/multi-team, sviluppata come progetto d'esame di
Ingegneria del Software (A.A. 2025/2026, Prof. Starace) — Federico II, matricola N86004038.

## Struttura del repository

```
bugboard26/
├── backend/                   # Node.js + Express + TypeScript + Sequelize
├── frontend/                  # Angular + TypeScript
├── docs/                      # Documentazione di progetto
├── scripts/                   # Script di avvio/gestione (dev, prod, migrate, reset, stop)
├── docker-compose.yml         # Infrastruttura (Postgres, Redis) — sempre necessario
├── docker-compose.dev.yml     # + backend/frontend in modalità sviluppo (hot-reload)
└── docker-compose.prod.yml    # + backend/frontend in modalità produzione
```

## Prerequisiti comuni

- Docker Desktop (per tutte le modalità sotto tranne la 3)
- Un account AWS con un User Pool Cognito e un bucket S3 già configurati (vedi documentazione,
  Capitolo 2, §2.2)

**Nota importante**: l'autenticazione dipende da AWS Cognito in modo strutturale, non opzionale —
ogni richiesta autenticata verifica il token contro Cognito, e l'entità Utente non conserva
nessuna password (per scelta di design, NFR04/NFR05: la sicurezza delle credenziali è delegata
interamente a un Identity Provider specializzato). Non è quindi possibile avviare l'applicazione
senza un User Pool Cognito configurato — non esiste una modalità "solo locale" che sostituisca
l'autenticazione. Creare il User Pool richiede un account AWS (anche solo Free Tier) e pochi
minuti di configurazione: vedi Capitolo 2, §2.2 della documentazione per i passaggi esatti.

Lo stesso vale per il bucket **S3** usato per gli allegati: è una risorsa AWS del tuo account,
non condivisa — se fai girare l'app da qualche parte, ti serve un tuo bucket, non quello usato
per la demo originale.

Entrambe le risorse (Cognito, S3) vanno inoltre **autorizzate esplicitamente** ad accettare
richieste dall'indirizzo da cui servirai il frontend, chiunque tu sia:
- `CORS_ORIGIN` in `backend/.env` deve corrispondere all'indirizzo del tuo frontend (di default
  `http://localhost:4200`, già corretto se lo fai girare in locale con una delle modalità sopra;
  se lo metti online su un server, cambialo con quell'indirizzo, es.
  `http://<il-tuo-ip-pubblico>:4200`)
- Sul bucket S3, la configurazione CORS (`AllowedOrigins`) va aggiornata allo stesso modo, con lo
  stesso indirizzo — altrimenti il caricamento degli allegati fallirà con un errore CORS pur
  funzionando tutto il resto

Questa configurazione è **lato server, una tantum**: chi visita semplicemente l'app dal browser
non deve mai toccare AWS né dare alcun consenso — riguarda solo chi la fa girare.

Un'ultima cosa da allineare se sposti il frontend altrove rispetto a `localhost`: l'indirizzo
del backend che il frontend chiama (`apiUrl` in `frontend/src/environments/environment.ts`) è
compilato dentro al bundle JavaScript in fase di build, non letto a runtime — se il backend non
gira sulla stessa macchina del browser che apre l'app (es. un server remoto), aggiorna
quel valore con l'indirizzo pubblico del backend **prima** di eseguire la build.

Prima di tutto, in ogni modalità:

```bash
git clone https://github.com/lucacardev/bugboard26.git
cd bugboard26
cd backend && cp .env.example .env && cd ..
```

Compila `backend/.env` con i tuoi valori (credenziali AWS, Cognito). Non serve modificare
`DB_HOST`/`DB_PORT`/`REDIS_HOST`/`REDIS_PORT` se usi una delle due modalità Docker sotto: vengono
già impostati correttamente dai rispettivi file compose.

Su Linux/macOS, la prima volta rendi eseguibili gli script:
```bash
chmod +x scripts/*.sh
```

Su Windows, usa i file `.cmd` (non i `.cmd` direttamente): sono un involucro sottile che bypassa
la policy di sicurezza di PowerShell **solo per quella singola esecuzione**, senza modificare
alcuna impostazione permanente sul tuo sistema — funzionano anche con doppio click da Esplora
File, oltre che da terminale.

---

## Modalità 1 — Full Docker, sviluppo (consigliata per contribuire al progetto)

Zero installazioni oltre a Docker: nessun Node, nessun Angular CLI, nessun Postgres locale.
Hot-reload su backend e frontend, il codice sorgente è montato da volume.

| | Windows | Linux/macOS |
|---|---|---|
| Avvia | `.\scripts\dev.cmd` | `./scripts/dev.sh` |
| Migration + admin (prima volta, o dopo nuove migration) | `.\scripts\migrate.cmd` | `./scripts/migrate.sh` |
| Ferma | `.\scripts\stop.cmd` | `./scripts/stop.sh` |
| Reset completo (cancella tutti i dati locali) | `.\scripts\reset.cmd` | `./scripts/reset.sh` |

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:4200`

Modifica un file in `backend/src` o `frontend/src`: il container corrispondente ricompila da
solo, senza bisogno di ricostruire l'immagine.

<details>
<summary>Comandi equivalenti, senza gli script</summary>

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npx sequelize-cli db:migrate
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run seed:admin:dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v   # reset, cancella i volumi
```
</details>

---

## Modalità 2 — Full Docker, produzione (demo rapida o base per un deploy reale)

Stesse immagini che verrebbero effettivamente distribuite: build multi-stage, nessun hot-reload,
frontend servito da nginx.

| | Windows | Linux/macOS |
|---|---|---|
| Avvia | `.\scripts\prod.cmd` | `./scripts/prod.sh` |
| Ferma | `.\scripts\stop.cmd` | `./scripts/stop.sh` |

Per migration e seed admin in questa modalità, usa i comandi equivalenti sotto sostituendo
`dev.yml` con `prod.yml` e `seed:admin:dev` con `seed:admin` (versione compilata):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npx sequelize-cli db:migrate
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npm run seed:admin
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:4200` (servito da nginx)

---

## Modalità 3 — Sviluppo nativo (solo infrastruttura in Docker)

Per chi preferisce eseguire backend e frontend direttamente sulla propria macchina, con i soli
Postgres e Redis containerizzati.

### Prerequisiti aggiuntivi

- Node.js 20+

### 1. Avvia Redis e Postgres

```bash
docker compose up -d
```

Postgres è raggiungibile su `localhost:5433` (non 5432, per non entrare in conflitto con
un'eventuale istanza Postgres già installata nativamente), Redis su `localhost:6379`.

> Se preferisci un Postgres già installato nativamente invece di quello containerizzato, avvia
> solo Redis (`docker compose up -d redis`) e punta `.env` alla tua istanza locale.

### 2. Backend

```bash
cd backend
npm install
npx sequelize-cli db:migrate
npm run seed:admin:dev
npm run dev
```

Il server sarà disponibile su `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

L'app sarà disponibile su `http://localhost:4200`.

### Test automatici

```bash
cd backend
npm test
```

---

## Problemi comuni

- **`password authentication failed for user "postgres"`**: Postgres inizializza la password
  solo alla primissima creazione del volume dati. Se cambi `POSTGRES_PASSWORD` dopo che il
  volume esiste già, non ha effetto finché non lo ricrei (`reset.cmd`/`reset.sh`, oppure
  `docker compose down -v`).
- **`relation "utenti" does not exist`** (o altre tabelle): il database è vuoto — rilancia
  `migrate.cmd`/`migrate.sh`.
- **`UsernameExistsException` creando un utente/admin**: l'account esiste già su AWS Cognito
  (servizio esterno, non toccato da un reset locale). Gestito automaticamente per l'admin di
  default e per la creazione utenti da interfaccia; se hai anche righe orfane su Postgres per
  utenti già cancellati da Cognito, vanno ripulite manualmente (vedi documentazione, §2.2).

## Documentazione

La documentazione completa di progetto (specifica dei requisiti, design, testing) si trova in
`docs/`.