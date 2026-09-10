@echo off
REM Ferma tutti i container (dev e/o prod, qualunque modalita' fosse attiva),
REM senza cancellare i dati persistiti su Postgres/Redis.
REM
REM Uso: scripts\stop.cmd
cd /d "%~dp0.."

docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml down