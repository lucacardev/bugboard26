#!/usr/bin/env bash
# Ferma tutti i container (dev e/o prod, qualunque modalità fosse attiva),
# senza cancellare i dati persistiti su Postgres/Redis.
#
# Uso: ./scripts/stop.sh
cd "$(dirname "$0")/.."

docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
