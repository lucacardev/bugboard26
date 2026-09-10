@echo off
REM Ferma tutto e cancella i volumi (Postgres, Redis): riparte da un
REM database completamente vuoto al prossimo avvio. Distruttivo, richiede
REM conferma.
REM
REM Nota: non tocca AWS Cognito (servizio esterno, indipendente da Docker)
REM -- eventuali utenti gia' creati li' restano, e vanno ricollegati
REM ricreandoli con la stessa email dall'interfaccia (creaUtenteCognito e'
REM idempotente rispetto a un utente gia' esistente), oppure ripuliti
REM manualmente dalla console AWS se non servono piu'.
REM
REM Uso: scripts\reset.cmd
setlocal
cd /d "%~dp0.."

set /p CONFERMA="Cancellare TUTTI i dati locali (Postgres, Redis)? Questa azione non e' reversibile. [y/N] "
if /i not "%CONFERMA%"=="y" (
    echo Annullato.
    exit /b 0
)

docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v

echo Fatto. Al prossimo avvio (dev.cmd o prod.cmd) il database ripartira' vuoto:
echo   ricorda di rilanciare le migration e il seed dell'admin (vedi migrate.cmd).
endlocal