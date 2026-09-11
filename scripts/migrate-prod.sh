#!/usr/bin/env bash
# Esegue le migration e crea (o ricollega) l'admin di default, in modalità
# produzione (usa seed:admin, versione compilata, non ts-node-dev).
# Va rilanciato dopo un reset, o dopo aver aggiunto nuove migration.
#
# Uso: ./scripts/migrate-prod.sh
set -e
cd "$(dirname "$0")/.."

docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npx sequelize-cli db:migrate
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npm run seed:admin