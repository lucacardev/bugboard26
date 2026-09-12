@echo off
setlocal EnableExtensions

REM Gestore unico BugBoard26 per Windows.
REM Uso:
REM   scripts\bugboard.cmd <dev|prod> <azione> [argomento]
REM
REM Esempi:
REM   scripts\bugboard.cmd dev up
REM   scripts\bugboard.cmd dev migrate
REM   scripts\bugboard.cmd dev test
REM   scripts\bugboard.cmd dev logs backend
REM   scripts\bugboard.cmd prod up

cd /d "%~dp0.."

set "MODE=%~1"
set "ACTION=%~2"
set "ARG1=%~3"
set "ARG2=%~4"

if "%MODE%"=="" goto :usage
if "%ACTION%"=="" set "ACTION=help"

if /I "%MODE%"=="dev" (
  set "COMPOSE=docker compose -f docker-compose.yml -f docker-compose.dev.yml"
  goto :mode_ok
)

if /I "%MODE%"=="prod" (
  set "COMPOSE=docker compose -f docker-compose.yml -f docker-compose.prod.yml"
  goto :mode_ok
)

echo Errore: ambiente non valido "%MODE%".
echo Su Windows usa dev o prod. Per AWS usa gli script .sh sulla macchina Linux.
exit /b 2

:mode_ok
docker info >nul 2>&1
if errorlevel 1 (
  echo Errore: Docker Desktop non e' avviato o non e' raggiungibile.
  exit /b 1
)

if /I "%ACTION%"=="up" goto :up
if /I "%ACTION%"=="start" goto :up
if /I "%ACTION%"=="rebuild" goto :rebuild
if /I "%ACTION%"=="migrate" goto :migrate
if /I "%ACTION%"=="test" goto :test
if /I "%ACTION%"=="coverage" goto :coverage
if /I "%ACTION%"=="build-check" goto :buildcheck
if /I "%ACTION%"=="status" goto :status
if /I "%ACTION%"=="ps" goto :status
if /I "%ACTION%"=="logs" goto :logs
if /I "%ACTION%"=="restart" goto :restart
if /I "%ACTION%"=="stop" goto :stop
if /I "%ACTION%"=="down" goto :stop
if /I "%ACTION%"=="backup" goto :backup
if /I "%ACTION%"=="db" goto :db
if /I "%ACTION%"=="redis" goto :redis
if /I "%ACTION%"=="reset" goto :reset
if /I "%ACTION%"=="help" goto :usage
if /I "%ACTION%"=="-h" goto :usage
if /I "%ACTION%"=="--help" goto :usage

echo Errore: azione non valida "%ACTION%".
goto :usage

:up
if not exist "backend\.env" (
  echo Errore: backend\.env non esiste.
  exit /b 1
)
echo Avvio ambiente %MODE%...
%COMPOSE% up -d --build
if errorlevel 1 exit /b 1
%COMPOSE% ps
exit /b %errorlevel%

:rebuild
if not exist "backend\.env" (
  echo Errore: backend\.env non esiste.
  exit /b 1
)
if "%ARG1%"=="" (
  %COMPOSE% up -d --build
) else (
  %COMPOSE% up -d --build %ARG1%
)
if errorlevel 1 exit /b 1
%COMPOSE% ps
exit /b %errorlevel%

:migrate
%COMPOSE% ps -q backend > "%TEMP%\bugboard_backend_cid.txt"
set /p BACKEND_CID=<"%TEMP%\bugboard_backend_cid.txt"
del "%TEMP%\bugboard_backend_cid.txt" >nul 2>&1
if "%BACKEND_CID%"=="" (
  echo Errore: backend non attivo. Avvia prima l'ambiente.
  exit /b 1
)

echo Esecuzione migration Sequelize...
%COMPOSE% exec -T backend npx sequelize-cli db:migrate
if errorlevel 1 exit /b 1

echo.
echo Verifica/creazione admin di default...
if /I "%MODE%"=="dev" (
  %COMPOSE% exec -T backend npm run seed:admin:dev
) else (
  %COMPOSE% exec -T backend npm run seed:admin
)
if errorlevel 1 exit /b 1

echo.
echo Migration e seed completati.
exit /b 0

:test
if /I not "%MODE%"=="dev" (
  echo Errore: i test vanno eseguiti in modalita' dev.
  exit /b 1
)
%COMPOSE% exec -T backend npm test -- --runInBand
exit /b %errorlevel%

:coverage
if /I not "%MODE%"=="dev" (
  echo Errore: la coverage va eseguita in modalita' dev.
  exit /b 1
)
%COMPOSE% exec -T backend npm test -- --coverage --runInBand
exit /b %errorlevel%

:buildcheck
if /I not "%MODE%"=="dev" (
  echo Errore: build-check va eseguito in modalita' dev.
  exit /b 1
)

echo Compilazione backend...
%COMPOSE% exec -T backend npm run build
if errorlevel 1 exit /b 1

echo.
echo Compilazione frontend...
%COMPOSE% exec -T frontend npm run build
if errorlevel 1 exit /b 1

echo.
echo Build-check completato.
exit /b 0

:status
%COMPOSE% ps
exit /b %errorlevel%

:logs
if "%ARG1%"=="" (
  if /I "%ARG2%"=="--follow" (
    %COMPOSE% logs --tail=150 -f
  ) else (
    %COMPOSE% logs --tail=150
  )
) else (
  if /I "%ARG1%"=="--follow" (
    %COMPOSE% logs --tail=150 -f
  ) else if /I "%ARG2%"=="--follow" (
    %COMPOSE% logs --tail=150 -f %ARG1%
  ) else (
    %COMPOSE% logs --tail=150 %ARG1%
  )
)
exit /b %errorlevel%

:restart
if "%ARG1%"=="" (
  %COMPOSE% restart
) else (
  %COMPOSE% restart %ARG1%
)
if errorlevel 1 exit /b 1
%COMPOSE% ps
exit /b %errorlevel%

:stop
%COMPOSE% down --remove-orphans
exit /b %errorlevel%

:backup
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "timestamp=%%I"
if not exist backups mkdir backups
set "BACKUP_FILE=backups\bugboard26_%MODE%_%timestamp%.sql"

echo Creazione backup PostgreSQL: %BACKUP_FILE%
%COMPOSE% exec -T postgres pg_dump -U postgres -d bugboard26 > "%BACKUP_FILE%"
if errorlevel 1 (
  echo Errore durante il backup.
  del "%BACKUP_FILE%" >nul 2>&1
  exit /b 1
)
echo Backup completato.
exit /b 0

:db
%COMPOSE% exec postgres psql -U postgres -d bugboard26
exit /b %errorlevel%

:redis
%COMPOSE% exec redis redis-cli
exit /b %errorlevel%

:reset
echo ATTENZIONE: verranno eliminati Postgres e Redis locali.
set /p CONFERMA="Scrivi RESET per confermare: "
if /I not "%CONFERMA%"=="RESET" (
  echo Annullato.
  exit /b 0
)

docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v --remove-orphans
echo Reset completato.
exit /b 0

:usage
echo.
echo BugBoard26 - gestione ambienti Windows
echo.
echo Uso:
echo   scripts\bugboard.cmd ^<dev^|prod^> ^<azione^> [argomento]
echo.
echo Azioni:
echo   up
echo   rebuild [servizio]
echo   migrate
echo   test
echo   coverage
echo   build-check
echo   status
echo   logs [servizio] [--follow]
echo   restart [servizio]
echo   stop
echo   backup
echo   db
echo   redis
echo   reset
echo.
echo Esempi:
echo   scripts\bugboard.cmd dev up
echo   scripts\bugboard.cmd dev migrate
echo   scripts\bugboard.cmd dev test
echo   scripts\bugboard.cmd dev logs backend --follow
echo   scripts\bugboard.cmd prod up
exit /b 0
