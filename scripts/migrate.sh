#!/usr/bin/env bash
# Esegue le migration e crea (o ricollega) l'admin di default.
# Va rilanciato dopo ogni reset.sh, o dopo aver aggiunto nuove migration.
#
# Targetta la modalità dev per default (il caso d'uso più comune). Per la
# modalità prod, sostituisci "dev" con "prod" nei due comandi sotto, e
# "seed:admin:dev" con "seed:admin" (versione compilata, non ts-node-dev).
#
# Uso: ./scripts/migrate.sh
set -e
cd "$(dirname "$0")/.."

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npx sequelize-cli db:migrate
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run seed:admin:dev
