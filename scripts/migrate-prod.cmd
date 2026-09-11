@echo off
REM Esegue le migration e crea (o ricollega) l'admin di default, in
REM modalita' produzione (usa seed:admin, versione compilata).
REM Va rilanciato dopo un reset, o dopo aver aggiunto nuove migration.
REM
REM Uso: scripts\migrate-prod.cmd
cd /d "%~dp0.."

docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npx sequelize-cli db:migrate
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npm run seed:admin