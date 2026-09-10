#!/usr/bin/env bash
# Ferma tutto e cancella i volumi (Postgres, Redis): riparte da un database
# completamente vuoto al prossimo avvio. Distruttivo, richiede conferma.
#
# Nota: non tocca AWS Cognito (servizio esterno, indipendente da Docker) —
# eventuali utenti già creati lì restano, e vanno ricollegati ricreandoli
# con la stessa email dall'interfaccia (creaUtenteCognito è idempotente
# rispetto a un utente già esistente), oppure ripuliti manualmente dalla
# console AWS se non servono più.
#
# Uso: ./scripts/reset.sh
cd "$(dirname "$0")/.."

read -p "Cancellare TUTTI i dati locali (Postgres, Redis)? Questa azione non è reversibile. [y/N] " conferma
if [[ "$conferma" != "y" && "$conferma" != "Y" ]]; then
  echo "Annullato."
  exit 0
fi

docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v

echo "Fatto. Al prossimo avvio (dev.sh o prod.sh) il database ripartirà vuoto:"
echo "  ricorda di rilanciare le migration e il seed dell'admin (vedi migrate.sh)."
