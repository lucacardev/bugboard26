#!/usr/bin/env bash
# Avvia infrastruttura + backend + frontend in modalità sviluppo
# (hot-reload, codice sorgente montato da volume).
#
# Uso: ./scripts/dev.sh
set -e
cd "$(dirname "$0")/.."

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
