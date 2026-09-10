@echo off
REM Avvia infrastruttura + backend + frontend in modalita' sviluppo
REM (hot-reload, codice sorgente montato da volume).
REM
REM Uso: scripts\dev.cmd
cd /d "%~dp0.."

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build