@echo off
REM Avvia infrastruttura + backend + frontend in modalita' produzione
REM (build multi-stage, nessun hot-reload, frontend servito da nginx).
REM
REM Uso: scripts\prod.cmd
cd /d "%~dp0.."

docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build