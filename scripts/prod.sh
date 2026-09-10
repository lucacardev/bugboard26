#!/usr/bin/env bash
# Avvia infrastruttura + backend + frontend in modalità produzione
# (build multi-stage, nessun hot-reload, frontend servito da nginx).
#
# Uso: ./scripts/prod.sh
set -e
cd "$(dirname "$0")/.."

docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
