@echo off
REM Esegue le migration e crea (o ricollega) l'admin di default.
REM Va rilanciato dopo ogni reset.cmd, o dopo aver aggiunto nuove migration.
REM
REM Targetta la modalita' dev per default (il caso d'uso piu' comune). Per
REM la modalita' prod, sostituisci "dev" con "prod" nei due comandi sotto,
REM e "seed:admin:dev" con "seed:admin" (versione compilata).
REM
REM Uso: scripts\migrate.cmd
cd /d "%~dp0.."

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npx sequelize-cli db:migrate
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run seed:admin:dev