# BugBoard26

BugBoard26 è una piattaforma web di issue tracking multi-progetto e multi-team sviluppata con **Angular**, **Node.js/Express**, **TypeScript**, **Sequelize**, **PostgreSQL**, **Redis/BullMQ**, **AWS Cognito** e **AWS S3**.

> Questo README descrive **solo le funzionalità presenti nel sorgente di questa versione**. Funzionalità della traccia non implementate nel codice corrente, come archiviazione, ricerca globale e reportistica/dashboard, non vengono presentate come disponibili.

## Funzionalità presenti

La versione corrente comprende:

- autenticazione tramite AWS Cognito, logout e completamento del primo accesso;
- ruoli `normale`, `amministratore` e `stakeholder`;
- account stakeholder in sola lettura;
- creazione utenti da parte dell'amministratore;
- creazione e gestione di progetti e relativi team;
- aggiunta/rimozione dei membri del team;
- issue di tipo `bug`, `question`, `documentation` e `feature`;
- stati `todo`, `in_progress` e `done`;
- titolo e descrizione obbligatori in creazione;
- priorità, date e assegnatario;
- vista elenco e board Kanban;
- filtri per tipo, stato e "solo mie";
- ordinamento per data, titolo e priorità;
- pagina con issue assegnate all'utente corrente;
- assegnazione amministrativa limitata ai membri assegnabili del team;
- cambio stato da parte dell'amministratore o dell'assegnatario;
- commenti con modifica da parte dell'autore ed eliminazione da autore/amministratore;
- etichette di progetto associabili alle issue;
- cronologia delle modifiche principali;
- allegati su AWS S3 tramite URL presigned;
- notifiche asincrone tramite Redis + BullMQ con Worker separato;
- notifiche su assegnazione e completamento; al passaggio a `done` vengono notificati anche gli stakeholder del team secondo la scelta progettuale adottata;
- test automatici backend con Jest.

## Architettura

```text
Angular frontend
      |
      | HTTP/REST
      v
Express Controller
      v
Service
      v
Repository
      v
Sequelize
      v
PostgreSQL

IssueService ----> Observer cronologia
             \\--> Observer notifiche --> BullMQ/Redis --> Worker --> PostgreSQL

Allegati ----------------------------------------------> AWS S3
Autenticazione ----------------------------------------> AWS Cognito
```

Il Worker delle notifiche è un processo/container separato dal server HTTP.

## Struttura principale

```text
bugboard26/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── seeders/
│   │   └── services/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── Dockerfile.worker
│   └── Dockerfile.worker.dev
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
├── scripts/
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── docker-compose.https.yml
```

## Prerequisiti

### Per l'esecuzione Docker

- Git
- Docker Desktop su Windows/macOS oppure Docker Engine + Compose plugin su Linux
- account AWS con:
  - Cognito User Pool;
  - bucket S3.

### Solo per lo sviluppo nativo

- Node.js 20+
- npm

PostgreSQL e Redis possono comunque rimanere in Docker.

## 1. Clonazione e configurazione

```bash
git clone https://github.com/lucacardev/bugboard26.git
cd bugboard26
```

Creare il file di configurazione backend.

### Linux/macOS

```bash
cp backend/.env.example backend/.env
```

### Windows PowerShell

```powershell
Copy-Item backend/.env.example backend/.env
```

Configurare almeno:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bugboard26
DB_USER=postgres
DB_PASSWORD=postgres

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-south-1
AWS_S3_BUCKET_NAME=...

COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
COGNITO_CLIENT_SECRET=...

REDIS_HOST=localhost
REDIS_PORT=6379

CORS_ORIGIN=http://localhost:4200

ADMIN_DEFAULT_EMAIL=admin@bugboard26.local
ADMIN_DEFAULT_PASSWORD=...
```

`AWS Cognito` non è opzionale: il backend verifica i token Cognito nelle richieste autenticate. Anche gli allegati richiedono un bucket S3 configurato.

### Password PostgreSQL

Il container PostgreSQL usa:

```text
POSTGRES_PASSWORD
```

presente nel file `.env` della **root** del repository, oppure il fallback `postgres`.

Per un ambiente locale semplice è quindi sufficiente mantenere:

```dotenv
DB_PASSWORD=postgres
```

in `backend/.env`.

Per produzione/deploy creare invece nella root:

```dotenv
POSTGRES_PASSWORD=una-password-robusta
```

Il file `.env` della root e `backend/.env` sono esclusi dal versionamento Git.

---

# Avvio rapido con gli script

Gli script centrali sono:

- Windows: `scripts\bugboard.cmd`
- Linux/macOS/AWS: `scripts/bugboard.sh`

## Comandi disponibili

```text
up
rebuild [servizio]
migrate
test
coverage
build-check
status
logs [servizio] [--follow]
restart [servizio]
stop
backup
db
redis
reset
```

In Linux è inoltre disponibile l'azione AWS:

```text
pull
deploy
```

## Ambienti

```text
dev   = docker-compose.yml + docker-compose.dev.yml
prod  = docker-compose.yml + docker-compose.prod.yml
aws   = docker-compose.yml + docker-compose.prod.yml + docker-compose.https.yml
```

---

# Modalità DEV — Docker con hot reload

È la modalità consigliata per modificare il progetto.

## Windows

```powershell
.\scripts\bugboard.cmd dev up
```

## Linux/macOS

```bash
bash scripts/bugboard.sh dev up
```

Servizi locali:

```text
Frontend:   http://localhost:4200
Backend:    http://localhost:3000
PostgreSQL: localhost:5433
Redis:      localhost:6379
```

Il codice backend/frontend viene montato nei container, quindi le modifiche vengono rilevate senza ricostruire manualmente le immagini.

## Prima inizializzazione del database DEV

In `dev` le migration **non vengono lanciate automaticamente** dal container backend.

Dopo il primo avvio eseguire:

### Windows

```powershell
.\scripts\bugboard.cmd dev migrate
```

oppure:

```powershell
.\scripts\migrate.cmd
```

### Linux/macOS

```bash
bash scripts/bugboard.sh dev migrate
```

oppure:

```bash
bash scripts/migrate.sh dev
```

Il comando esegue:

1. migration Sequelize;
2. creazione/verifica dell'admin di default.

## Arresto DEV

```powershell
.\scripts\bugboard.cmd dev stop
```

oppure:

```bash
bash scripts/bugboard.sh dev stop
```

## Reset completo locale

```powershell
.\scripts\bugboard.cmd dev reset
```

oppure:

```bash
bash scripts/bugboard.sh dev reset
```

Il reset elimina i volumi PostgreSQL e Redis. Non usarlo su dati da conservare.

---

# Modalità PROD — build di produzione in locale

Questa modalità usa le immagini di produzione, senza hot reload.

## Windows

```powershell
.\scripts\bugboard.cmd prod up
```

## Linux/macOS

```bash
bash scripts/bugboard.sh prod up
```

Il frontend viene compilato e servito da nginx.

> In `prod` il backend esegue automaticamente, tramite `backend/docker-entrypoint.sh`, **migration + seed admin + avvio Express**. Non è necessario lanciare contemporaneamente un secondo comando `migrate` dopo `up`.

Ogni modifica al codice richiede una nuova build:

```powershell
.\scripts\bugboard.cmd prod rebuild
```

oppure:

```bash
bash scripts/bugboard.sh prod rebuild
```

Per ricostruire un solo servizio:

```bash
bash scripts/bugboard.sh prod rebuild frontend
bash scripts/bugboard.sh prod rebuild backend
bash scripts/bugboard.sh prod rebuild worker
```

## Migration manuale in PROD

L'azione resta disponibile per manutenzione **quando il backend è già completamente avviato**:

```bash
bash scripts/bugboard.sh prod migrate
```

Non lanciarla in parallelo all'avvio di un nuovo container backend: il suo entrypoint sta già eseguendo le migration.

---

# Modalità nativa — backend/frontend fuori da Docker

Utile per lavorare direttamente con Node e Angular mantenendo soltanto PostgreSQL e Redis in container.

## 1. Avvia infrastruttura

```bash
docker compose up -d
```

Il file Compose pubblica:

```text
PostgreSQL: localhost:5433
Redis:      localhost:6379
```

Per questa modalità modificare `backend/.env` così:

```dotenv
DB_HOST=localhost
DB_PORT=5433
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:4200
```

## 2. Backend

```bash
cd backend
npm install
npx sequelize-cli db:migrate
npm run seed:admin:dev
npm run dev
```

Backend:

```text
http://localhost:3000
```

## 3. Worker notifiche

Aprire un secondo terminale:

```bash
cd backend
npm run dev:worker
```

Senza il Worker, i job di notifica possono essere inseriti in Redis ma non vengono elaborati.

## 4. Frontend

Aprire un terzo terminale:

```bash
cd frontend
npm install
npm start
```

Frontend:

```text
http://localhost:4200
```

---

# Test automatici

I test backend usano Jest.

## Docker DEV

### Windows

```powershell
.\scripts\test.cmd
```

### Linux/macOS

```bash
bash scripts/test.sh
```

Equivalentemente:

```bash
bash scripts/bugboard.sh dev test
```

## Coverage

```powershell
.\scripts\coverage.cmd
```

oppure:

```bash
bash scripts/coverage.sh
```

## Build check

```bash
bash scripts/bugboard.sh dev build-check
```

Compila sia backend sia frontend e permette di individuare errori TypeScript/build prima del commit.

Nell'ultima verifica del progetto le suite backend risultavano verdi con:

```text
Test Suites: 5 passed, 5 total
Tests:       27 passed, 27 total
```

---

# Comandi di manutenzione

## Stato

```powershell
.\scripts\bugboard.cmd dev status
.\scripts\bugboard.cmd prod status
```

```bash
bash scripts/bugboard.sh dev status
bash scripts/bugboard.sh prod status
bash scripts/bugboard.sh aws status
```

## Log

```bash
bash scripts/bugboard.sh dev logs backend
bash scripts/bugboard.sh dev logs backend --follow
bash scripts/bugboard.sh aws logs worker --follow
```

## Backup PostgreSQL

```bash
bash scripts/bugboard.sh prod backup
bash scripts/bugboard.sh aws backup
```

I dump vengono salvati in:

```text
backups/
```

## Console PostgreSQL

```bash
bash scripts/bugboard.sh dev db
```

## Redis CLI

```bash
bash scripts/bugboard.sh dev redis
```

---

# Deploy Linux / AWS EC2 con HTTPS

La configurazione HTTPS inclusa nel repository è pensata per un server Linux con nginx nel container frontend e certificati Let's Encrypt montati da `/etc/letsencrypt`.

## 1. Server

Configurazione tipica:

- Ubuntu;
- Docker Engine + Compose plugin;
- Git;
- IP pubblico stabile / Elastic IP;
- porte pubbliche `80` e `443`;
- porta `22` limitata al proprio IP.

Il Security Group/firewall dovrebbe **non esporre pubblicamente 3000, 4200, 5433 e 6379**.

Anche se un override Compose tenta di rimuovere una porta, le liste Compose possono essere unite durante il merge: il firewall resta quindi il controllo autorevole per l'esposizione pubblica.

## 2. Clone

```bash
cd ~
git clone https://github.com/lucacardev/bugboard26.git
cd bugboard26
cp backend/.env.example backend/.env
```

Creare anche:

```bash
nano .env
```

con:

```dotenv
POSTGRES_PASSWORD=una-password-robusta
```

## 3. Backend production environment

In `backend/.env` configurare Cognito, S3 e:

```dotenv
CORS_ORIGIN=https://TUO_HOST
```

Esempio con nip.io:

```text
https://1-2-3-4.nip.io
```

Usare credenziali admin diverse dai valori di esempio.

## 4. Configurazione frontend/nginx

Nella versione corrente questi file contengono valori specifici dell'host di deploy e vanno adattati:

```text
frontend/src/environments/environment.ts
frontend/nginx.conf
```

Impostare nel frontend:

```typescript
apiUrl: 'https://TUO_HOST/api'
```

In `nginx.conf` aggiornare:

```nginx
server_name TUO_HOST;
ssl_certificate /etc/letsencrypt/live/TUO_HOST/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/TUO_HOST/privkey.pem;
```

Poiché sono file versionati ma la loro configurazione può essere specifica della macchina, è possibile mantenerli locali con:

```bash
git update-index --skip-worktree frontend/src/environments/environment.ts frontend/nginx.conf
```

Per tornare al comportamento Git normale:

```bash
git update-index --no-skip-worktree frontend/src/environments/environment.ts frontend/nginx.conf
```

> Se una futura versione modifica uno di questi file nel repository, rimuovere temporaneamente `skip-worktree`, integrare la modifica e poi riapplicarlo.

## 5. Certificato Let's Encrypt

Installare Certbot:

```bash
sudo apt update
sudo apt install -y certbot
```

Assicurarsi che la porta 80 sia libera e pubblicamente raggiungibile, quindi:

```bash
sudo certbot certonly --standalone \
  -d TUO_HOST \
  --agree-tos \
  --non-interactive \
  -m tua-email@example.com
```

I certificati devono risultare disponibili in:

```text
/etc/letsencrypt/live/TUO_HOST/
```

## 6. CORS S3

Nel bucket S3 aggiungere l'host HTTPS del frontend negli `AllowedOrigins`.

## 7. Primo deploy e aggiornamenti

Lo script AWS esegue:

```text
backup DB, se PostgreSQL è già attivo
→ git pull --ff-only
→ docker compose up -d --build
→ attesa del vero avvio HTTP del backend
→ verifica Worker
→ docker compose ps
```

Il backend di produzione esegue **da solo**:

```text
db:migrate
→ seed admin
→ avvio Express
```

Perciò lo script di deploy **non lancia una seconda migration**, evitando race condition tra due `sequelize-cli db:migrate` concorrenti.

Avvio:

```bash
bash scripts/deploy.sh
```

Se i file `.sh` sono già marcati come eseguibili nel repository è possibile usare:

```bash
./scripts/deploy.sh
```

## Aggiornamenti successivi

Dopo aver effettuato `git push` dal computer di sviluppo, sul server basta:

```bash
cd ~/bugboard26
bash scripts/deploy.sh
```

Lo script interrompe il deploy se rileva modifiche Git locali non previste.

## Controllo finale

```bash
bash scripts/bugboard.sh aws status
bash scripts/bugboard.sh aws logs backend
bash scripts/bugboard.sh aws logs worker
```

Aprire quindi:

```text
https://TUO_HOST
```

---

# Deploy su Windows

È disponibile anche:

```powershell
.\scripts\deploy.cmd
```

per una macchina Windows con Docker Desktop/Engine e Git.

Per aggiungere l'override HTTPS:

```powershell
.\scripts\deploy.cmd https
```

Tuttavia `docker-compose.https.yml` e `frontend/nginx.conf` sono predisposti per certificati Let's Encrypt montati da un percorso Linux (`/etc/letsencrypt`), quindi **HTTPS su host Windows richiede l'adattamento dei volumi e dei percorsi dei certificati**.

Per una demo locale in produzione su Windows è più semplice usare:

```powershell
.\scripts\bugboard.cmd prod up
```

---

# Note sulle migration

Lo schema è gestito esclusivamente tramite migration Sequelize: l'applicazione non usa `sequelize.sync()` per creare o aggiornare le tabelle.

Comportamento per ambiente:

| Ambiente | Migration |
|---|---|
| `dev` Docker | manuale con `bugboard ... migrate` |
| nativo | manuale con `npx sequelize-cli db:migrate` |
| `prod` Docker | automatica nel `docker-entrypoint.sh` |
| `aws` deploy | automatica nel `docker-entrypoint.sh` |

### Importante

Non eseguire contemporaneamente una migration manuale mentre un nuovo container backend di produzione sta ancora eseguendo il proprio entrypoint.

Due processi `db:migrate` concorrenti possono leggere la stessa migration come pendente e tentare di creare contemporaneamente lo stesso vincolo/indice.

---

# Problemi comuni

## `Permission denied` sugli script Linux

Eseguire direttamente tramite Bash:

```bash
bash scripts/deploy.sh
```

oppure rendere eseguibili gli script:

```bash
chmod +x scripts/*.sh
```

Nel repository è consigliato versionare il bit eseguibile degli `.sh`.

Da Windows/Git:

```powershell
git ls-files "scripts/*.sh" | ForEach-Object { git update-index --chmod=+x -- $_ }
```

## Il deploy dice che ci sono modifiche Git locali

Verificare:

```bash
git status
```

Non usare `git reset --hard` senza sapere cosa si sta eliminando.

Per configurazioni host-specific già intenzionalmente modificate si può usare `skip-worktree` come descritto nella sezione AWS.

## `relation ... already exists` durante una migration

Prima di modificare manualmente `SequelizeMeta`, verificare sempre sia il vincolo/indice PostgreSQL sia la tabella delle migration.

Se il problema compare durante un deploy, controllare soprattutto che non siano in esecuzione **due migration contemporanee**.

## `password authentication failed for user postgres`

La password del volume PostgreSQL viene fissata alla prima inizializzazione.

Cambiare successivamente `POSTGRES_PASSWORD` non cambia automaticamente la password salvata nel volume esistente.

Per un ambiente locale eliminabile:

```bash
docker compose down -v
```

Attenzione: elimina i dati.

## `relation "utenti" does not exist`

In ambiente DEV eseguire:

```bash
bash scripts/bugboard.sh dev migrate
```

## Il frontend non mostra le ultime modifiche in PROD/AWS

Le immagini production contengono il bundle Angular compilato. Serve una nuova build:

```bash
bash scripts/bugboard.sh prod rebuild frontend
```

oppure eseguire nuovamente il deploy AWS.

Poi effettuare un hard refresh del browser.

## Le notifiche non arrivano

Controllare il Worker:

```bash
bash scripts/bugboard.sh dev logs worker
```

oppure:

```bash
bash scripts/bugboard.sh aws logs worker
```

## Login locale non mantiene la sessione

La configurazione cookie usa `Secure` per default. I browser moderni gestiscono normalmente `localhost`, ma se l'ambiente locale specifico rifiuta il cookie è possibile impostare **solo per sviluppo HTTP**:

```dotenv
COOKIE_SECURE=false
```

Non disattivarlo nel deploy HTTPS.

## S3 blocca l'upload

Controllare:

- `AWS_REGION`;
- nome bucket;
- credenziali AWS;
- permessi IAM;
- CORS del bucket;
- `AllowedOrigins` coerente con il frontend.

---

# Stack

### Frontend

- Angular
- TypeScript
- Angular Material / CDK
- nginx in produzione

### Backend

- Node.js 20
- Express
- TypeScript
- Sequelize
- PostgreSQL 16

### Servizi esterni / asincroni

- AWS Cognito
- AWS S3
- Redis 7
- BullMQ

### Qualità

- Jest
- coverage
- build TypeScript backend/frontend

---

## Licenza

Vedere il file `LICENSE` presente nel repository.
