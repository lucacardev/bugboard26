@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================================
REM BugBoard26 - deploy produzione su macchina Windows
REM
REM Uso:
REM   .\scripts\deploy.cmd
REM       -> produzione HTTP: docker-compose.yml + docker-compose.prod.yml
REM
REM   .\scripts\deploy.cmd https
REM       -> aggiunge docker-compose.https.yml
REM
REM Nota HTTPS:
REM docker-compose.https.yml deve usare percorsi/certificati compatibili
REM con la macchina Windows su cui viene eseguito il deploy.
REM ============================================================

cd /d "%~dp0.."

set "MODE=%~1"
set "COMPOSE=docker compose -f docker-compose.yml -f docker-compose.prod.yml"

if /I "%MODE%"=="https" (
    set "COMPOSE=docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml"
)

echo.
echo ==========================================
echo   BugBoard26 - Deploy Windows
echo ==========================================
echo.

REM ------------------------------------------------------------
REM 1. Controlli preliminari
REM ------------------------------------------------------------

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERRORE] Docker non e' avviato o non e' raggiungibile.
    exit /b 1
)

git --version >nul 2>&1
if errorlevel 1 (
    echo [ERRORE] Git non e' installato o non e' nel PATH.
    exit /b 1
)

if not exist "backend\.env" (
    echo [ERRORE] backend\.env non esiste.
    exit /b 1
)

if not exist ".env" (
    echo [ERRORE] .env nella root non esiste.
    echo Deve contenere almeno POSTGRES_PASSWORD.
    exit /b 1
)

git diff --quiet
if errorlevel 1 (
    echo [ERRORE] Ci sono modifiche Git non committate sulla macchina di deploy.
    git status --short
    exit /b 1
)

git diff --cached --quiet
if errorlevel 1 (
    echo [ERRORE] Ci sono modifiche Git in staging non committate.
    git status --short
    exit /b 1
)

echo [OK] Controlli preliminari superati.
echo.

REM ------------------------------------------------------------
REM 2. Backup PostgreSQL, se il database e' gia' attivo
REM ------------------------------------------------------------

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "TIMESTAMP=%%I"

if not exist "backups" mkdir "backups"

docker compose -f docker-compose.yml -f docker-compose.prod.yml ps -q postgres > "%TEMP%\bugboard_postgres_cid.txt"
set /p POSTGRES_CID=<"%TEMP%\bugboard_postgres_cid.txt"
del "%TEMP%\bugboard_postgres_cid.txt" >nul 2>&1

if not "%POSTGRES_CID%"=="" (
    set "BACKUP_FILE=backups\bugboard26_windows_%TIMESTAMP%.sql"
    echo [1/5] Backup PostgreSQL in !BACKUP_FILE! ...

    docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres -d bugboard26 > "!BACKUP_FILE!"

    if errorlevel 1 (
        echo [ERRORE] Backup PostgreSQL fallito. Deploy interrotto.
        del "!BACKUP_FILE!" >nul 2>&1
        exit /b 1
    )

    echo [OK] Backup completato.
) else (
    echo [1/5] PostgreSQL non e' attivo: backup pre-deploy saltato.
)

echo.

REM ------------------------------------------------------------
REM 3. Aggiornamento repository
REM ------------------------------------------------------------

echo [2/5] Aggiornamento repository con git pull --ff-only ...

git pull --ff-only
if errorlevel 1 (
    echo [ERRORE] git pull fallito. Deploy interrotto.
    exit /b 1
)

echo [OK] Repository aggiornato.
echo.

REM ------------------------------------------------------------
REM 4. Build e avvio container
REM ------------------------------------------------------------

echo [3/5] Build e avvio container ...

%COMPOSE% up -d --build
if errorlevel 1 (
    echo [ERRORE] Build/avvio Docker fallito.
    exit /b 1
)

echo [OK] Container avviati.
echo.

REM ------------------------------------------------------------
REM 5. Attesa backend
REM ------------------------------------------------------------

echo [4/5] Attendo l'avvio del backend ...

set /a ATTEMPTS=0

:WAIT_BACKEND
set /a ATTEMPTS+=1

%COMPOSE% ps -q backend > "%TEMP%\bugboard_backend_cid.txt"
set "BACKEND_CID="
set /p BACKEND_CID=<"%TEMP%\bugboard_backend_cid.txt"
del "%TEMP%\bugboard_backend_cid.txt" >nul 2>&1

if not "!BACKEND_CID!"=="" (
    for /f %%R in ('docker inspect -f "{{.State.Running}}" !BACKEND_CID! 2^>nul') do set "BACKEND_RUNNING=%%R"

    if /I "!BACKEND_RUNNING!"=="true" goto BACKEND_READY
)

if !ATTEMPTS! GEQ 30 (
    echo [ERRORE] Il backend non risulta attivo dopo 60 secondi.
    echo.
    %COMPOSE% logs --tail=100 backend
    exit /b 1
)

timeout /t 2 /nobreak >nul
goto WAIT_BACKEND

:BACKEND_READY
echo [OK] Backend attivo.
echo.

REM ------------------------------------------------------------
REM 6. Migration + seed admin
REM ------------------------------------------------------------

echo [5/5] Esecuzione migration Sequelize ...

%COMPOSE% exec -T backend npx sequelize-cli db:migrate
if errorlevel 1 (
    echo [ERRORE] Migration fallita.
    exit /b 1
)

echo.
echo Verifica/creazione admin di default ...

%COMPOSE% exec -T backend npm run seed:admin
if errorlevel 1 (
    echo [ERRORE] Seed admin fallito.
    exit /b 1
)

echo.
echo ==========================================
echo   Stato finale
echo ==========================================
echo.

%COMPOSE% ps

echo.
echo [OK] Deploy Windows completato con successo.
echo.
echo Comandi utili:
echo   .\scripts\bugboard.cmd prod status
echo   .\scripts\bugboard.cmd prod logs backend --follow
echo.
echo Se hai usato:
echo   .\scripts\deploy.cmd https
echo ricorda che i certificati e i volumi HTTPS devono essere
echo configurati con percorsi compatibili con Windows.
echo.

exit /b 0
