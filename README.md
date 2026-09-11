# BugBoard26

Piattaforma di issue tracking multi-progetto/multi-team, sviluppata come progetto d'esame di
Ingegneria del Software (A.A. 2025/2026, Prof. Starace) — Federico II, matricola N86004038.

## Indice

- [Struttura del repository](#struttura-del-repository)
- [Prerequisiti comuni](#prerequisiti-comuni)
- [Testare in locale](#testare-in-locale)
  - [Modalità 1 — Full Docker, sviluppo](#modalità-1--full-docker-sviluppo-consigliata-per-contribuire-al-progetto)
  - [Modalità 2 — Full Docker, produzione](#modalità-2--full-docker-produzione-demo-rapida-in-locale)
  - [Modalità 3 — Sviluppo nativo](#modalità-3--sviluppo-nativo-solo-infrastruttura-in-docker)
- [Deploy su un server reale](#deploy-su-un-server-reale)
- [Problemi comuni](#problemi-comuni)
- [Documentazione](#documentazione)

---

## Struttura del repository

```
bugboard26/
├── backend/                     # Node.js + Express + TypeScript + Sequelize
├── frontend/                    # Angular + TypeScript
├── docs/                        # Documentazione di progetto
├── scripts/                     # Script di avvio/gestione (dev, prod, migrate, reset, stop)
├── docker-compose.yml           # Infrastruttura (Postgres, Redis) — sempre necessario, in ogni scenario
├── docker-compose.dev.yml       # + backend/frontend in modalità sviluppo (hot-reload)
├── docker-compose.prod.yml      # + backend/frontend in modalità produzione (build multi-stage)
└── docker-compose.https.yml     # + HTTPS reale (reverse proxy nginx) — SOLO per deploy, vedi sotto
```

**Come si combinano i file compose** — nessuno di questi file funziona da solo (eccetto il primo,
che da solo avvia solo l'infrastruttura): si passano sempre insieme con più flag `-f`, e ognuno
aggiunge/modifica quello che c'è già nei file precedenti. Le due combinazioni valide sono:

- **Sviluppo**: `docker-compose.yml` + `docker-compose.dev.yml`
- **Produzione** (locale o deploy): `docker-compose.yml` + `docker-compose.prod.yml`, con
  `docker-compose.https.yml` aggiunto in più **solo** per un deploy con HTTPS reale (vedi sezione
  dedicata) — quest'ultimo da solo non definisce nulla, si limita a correggere le porte e i volumi
  di un servizio `frontend` che deve già esistere, definito nel file prod.

Gli script in `scripts/` uniscono già i file giusti in automatico — non serve mai scriverli a
mano se usi quelli.

**Una cosa non ovvia da sapere**, se in futuro personalizzi questi file: per campi come `ports`,
`volumes` ed `expose`, Docker Compose **unisce le liste dei vari file per somma**, non le
sostituisce — scrivere `ports: []` in un file aggiuntivo per "svuotare" una porta già pubblicata
in un file precedente **non ha alcun effetto** (l'abbiamo scoperto a nostre spese durante il
deploy: la porta 3000 del backend è rimasta esposta anche con `docker-compose.https.yml`
applicato). Per chiudere davvero l'accesso pubblico a una porta in questi casi, l'unico modo
affidabile è a un livello più a monte — il firewall (Security Group su AWS, `ufw` su un server
generico), non il file compose stesso.

---

## Prerequisiti comuni

- **Docker Desktop** (Windows/macOS) o **Docker Engine + Compose plugin** (Linux) — per tutte le
  modalità sotto tranne la 3
- Un account AWS con un **User Pool Cognito** e un **bucket S3** già configurati (vedi
  documentazione, Capitolo 2, §2.2, per i passaggi di creazione)

**Nota importante sull'autenticazione**: dipende da AWS Cognito in modo strutturale, non
opzionale — ogni richiesta autenticata verifica il token contro Cognito, e l'entità Utente non
conserva nessuna password (scelta di design esplicita, NFR04/NFR05: la sicurezza delle
credenziali è delegata interamente a un Identity Provider specializzato, invece di gestire hash,
reset password e sessioni internamente). **Non esiste una modalità "solo locale" che sostituisca
l'autenticazione** — un User Pool Cognito è sempre necessario, anche per il solo sviluppo in
locale. Crearlo richiede un account AWS (il Free Tier basta abbondantemente) e pochi minuti.

Lo stesso vale per il bucket **S3** usato per gli allegati: è una risorsa del tuo account AWS,
non condivisa — chi fa girare l'app altrove ha bisogno di un proprio bucket, non di quello usato
per la demo originale.

Entrambe le risorse vanno inoltre **autorizzate esplicitamente** ad accettare richieste
dall'indirizzo da cui servirai il frontend — dettaglio ripreso più volte sotto, in entrambi gli
scenari (locale e deploy):
- `CORS_ORIGIN` in `backend/.env` deve corrispondere all'indirizzo del frontend
- Sul bucket S3, la configurazione CORS (`AllowedOrigins`) va allineata allo stesso indirizzo

Questa configurazione è **lato server, una tantum**: chi visita semplicemente l'app dal browser
non deve mai toccare AWS né dare alcun consenso — riguarda solo chi la fa girare.

Prima di tutto, in ogni scenario:

```bash
git clone https://github.com/lucacardev/bugboard26.git
cd bugboard26
cd backend && cp .env.example .env && cd ..
```

Compila `backend/.env` con le tue credenziali AWS/Cognito reali. Le variabili di connessione a
Postgres/Redis (`DB_HOST`, `DB_PORT`, `REDIS_HOST`, `REDIS_PORT`) non vanno toccate se usi una
delle modalità Docker sotto: i file compose le impostano già correttamente in automatico,
sovrascrivendo qualunque valore presente in `.env`.

Su Linux/macOS, rendi eseguibili gli script (una volta sola):
```bash
chmod +x scripts/*.sh
```
Su Windows, usa i file `.cmd` (non serve nessuna configurazione preliminare — funzionano anche
con doppio click da Esplora File, senza toccare l'execution policy di PowerShell).

---

## Testare in locale

Tre modalità, in ordine di raccomandazione. Tutte e tre condividono **lo stesso database**
(stessi volumi Docker `postgres-data`/`redis-data`): passare dall'una all'altra sulla stessa
macchina non richiede ripopolare i dati.

### Modalità 1 — Full Docker, sviluppo (consigliata per contribuire al progetto)

Zero installazioni oltre a Docker: nessun Node, nessun Angular CLI, nessun Postgres locale.
Hot-reload su backend e frontend — il codice sorgente è montato da volume (bind mount), non
copiato dentro l'immagine: ogni modifica sul disco è immediatamente visibile dentro al
container, senza ricostruire nulla.

| | Windows | Linux/macOS |
|---|---|---|
| Avvia | `.\scripts\dev.cmd` | `./scripts/dev.sh` |
| Migration + admin (prima volta, o dopo nuove migration) | `.\scripts\migrate.cmd` | `./scripts/migrate.sh` |
| Ferma | `.\scripts\stop.cmd` | `./scripts/stop.sh` |
| Reset completo (cancella tutti i dati locali) | `.\scripts\reset.cmd` | `./scripts/reset.sh` |

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:4200`

<details>
<summary>Comandi equivalenti, senza gli script</summary>

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npx sequelize-cli db:migrate
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run seed:admin:dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v   # reset, cancella i volumi
```
</details>

### Modalità 2 — Full Docker, produzione (demo rapida in locale)

Stesse immagini che verrebbero effettivamente distribuite: build multi-stage, frontend servito
da nginx su HTTP semplice (per il deploy con HTTPS reale, vedi la sezione dedicata più sotto —
sono due scenari diversi, non la stessa cosa).

**Punto cruciale da capire, a differenza della Modalità 1**: qui il codice sorgente viene
**copiato dentro l'immagine nel momento della build** (`COPY src ./src` nel `Dockerfile`), non
montato da volume — l'immagine risultante è un'istantanea congelata, senza alcun collegamento
vivo con i file sul disco. Questo significa che **ogni modifica al codice — inclusa una nuova
migration, o un semplice `git pull` — richiede un rebuild esplicito per avere effetto**:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
Senza `--build`, il container continua a girare con il codice di quando fu costruito
l'ultima volta, ignorando silenziosamente qualunque cambiamento successivo — anche se i file sul
disco sono aggiornati. Non è un bug, è il comportamento corretto e voluto di un'immagine di
produzione (autosufficiente, riproducibile), ma va tenuto a mente.

| | Windows | Linux/macOS |
|---|---|---|
| Avvia | `.\scripts\prod.cmd` | `./scripts/prod.sh` |
| Migration + admin | `.\scripts\migrate-prod.cmd` | `./scripts/migrate-prod.sh` |
| Ferma | `.\scripts\stop.cmd` | `./scripts/stop.sh` |

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:4200` (servito da nginx)

<details>
<summary>Comandi equivalenti, senza gli script</summary>

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npx sequelize-cli db:migrate
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npm run seed:admin
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```
</details>

### Modalità 3 — Sviluppo nativo (solo infrastruttura in Docker)

Per chi preferisce eseguire backend e frontend direttamente sulla propria macchina, con i soli
Postgres e Redis containerizzati.

**Prerequisiti aggiuntivi**: Node.js 20+

**1. Avvia Redis e Postgres**
```bash
docker compose up -d
```
Postgres è raggiungibile su `localhost:5433` (non 5432, per non entrare in conflitto con
un'eventuale istanza Postgres già installata nativamente), Redis su `localhost:6379`.

> Se preferisci un Postgres già installato nativamente invece di quello containerizzato, avvia
> solo Redis (`docker compose up -d redis`) e punta `.env` alla tua istanza locale.

**2. Backend**
```bash
cd backend
npm install
npx sequelize-cli db:migrate
npm run seed:admin:dev
npm run dev
```
Disponibile su `http://localhost:3000`.

**3. Frontend**
```bash
cd frontend
npm install
npm start
```
Disponibile su `http://localhost:4200`.

**Test automatici**
```bash
cd backend
npm test
```

---

## Deploy su un server reale

Scenario diverso dalle modalità locali sopra: qui il frontend viene visitato da **browser su
macchine diverse dal server** — "localhost" non significa più nulla, e serve un indirizzo
pubblico reale. Questa guida usa come riferimento un'istanza **AWS EC2** con **IP elastico**
(indirizzo pubblico fisso) e **HTTPS reale** tramite un certificato Let's Encrypt gratuito,
ottenuto senza possedere un dominio proprio grazie a [nip.io](https://nip.io) (servizio gratuito
che traduce qualunque IP in un nome di dominio valido, es. `16-22-36-130.nip.io` per l'IP
`16.22.36.130`). I passaggi sono comunque applicabili, con adattamenti minimi, a qualunque VPS
con IP pubblico fisso (non solo EC2).

### Perché non "semplicemente" HTTP sull'IP pubblico

Tecnicamente funzionerebbe (con l'accortezza di impostare `COOKIE_SECURE=false`, vedi
`.env.example`), ma con un limite reale da conoscere: un cookie con `Secure: true` (il default,
corretto, di questa app) viene inviato dal browser **solo su connessioni HTTPS** — eccetto
un'eccezione che i browser riservano specificamente a `localhost`, che **non si applica a un IP
pubblico reale**. Senza HTTPS, il login funzionerebbe (Cognito valida le credenziali), ma ogni
richiesta successiva risulterebbe non autenticata, perché il cookie di sessione non
arriverebbe mai al backend ("Accesso riuscito ma impossibile recuperare i dati utente" è il
sintomo esatto di questo problema). Questa guida configura HTTPS vero per evitare del tutto quel
limite, invece di aggirarlo abbassando la sicurezza.

### 1. Predisponi l'istanza

- Regione, tipo istanza e storage a scelta; per riferimento, un'istanza EC2 `t3.small` (2 GB RAM,
  necessari per far girare Postgres + Redis + backend + frontend insieme) con 20 GB di storage
  gp3 è più che sufficiente per una demo
- **Alloca un Elastic IP** e associalo all'istanza — senza, l'IP pubblico cambierebbe a ogni
  riavvio, invalidando tutta la configurazione fatta più sotto
- **Security Group**, regole in entrata:

  | Tipo | Porta | Origine | Uso |
  |---|---|---|---|
  | SSH | 22 | il tuo IP | amministrazione |
  | HTTP | 80 | Ovunque (0.0.0.0/0) | redirect a HTTPS + validazione certificato |
  | HTTPS | 443 | Ovunque (0.0.0.0/0) | traffico applicativo reale |

  Le porte 3000/4200 **non vanno esposte pubblicamente** in questo scenario: nginx fa da unico
  punto d'ingresso. Se le hai aperte in un primo momento (es. per testare prima di passare a
  HTTPS) ricordati di **rimuoverle dal Security Group** una volta completato il setup HTTPS sotto
  — i file compose da soli non bastano a richiuderle davvero (vedi nota tecnica in cima a questo
  README sul merge delle liste `ports`).

### 2. Installa Docker sull'istanza (Ubuntu)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg git

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```
Disconnetti e riconnetti via SSH perché il gruppo `docker` abbia effetto, poi verifica:
```bash
docker ps
```
(deve funzionare senza `sudo` e senza errori)

### 3. Clona il repository e configura

```bash
cd ~
git clone https://github.com/lucacardev/bugboard26.git
cd bugboard26
cd backend && cp .env.example .env && nano .env
```
Compila con le tue credenziali AWS/Cognito reali, e imposta (sostituendo con il tuo dominio
nip.io, derivato dal tuo IP elastico con i punti sostituiti da trattini):
```
CORS_ORIGIN=https://<il-tuo-ip-con-i-trattini>.nip.io
```
Poi, nella **root** del progetto, crea un secondo `.env` (distinto da `backend/.env`, alimenta
`POSTGRES_PASSWORD` nei file compose):
```bash
cd ~/bugboard26
nano .env
```
```
POSTGRES_PASSWORD=<una-password-a-tua-scelta>
```

Aggiorna anche l'indirizzo dell'API compilato dentro al frontend — è un valore fissato in fase
di build, non letto a runtime:
```bash
nano frontend/src/environments/environment.ts
```
```typescript
apiUrl: 'https://<il-tuo-ip-con-i-trattini>.nip.io/api',
```

### 4. Ottieni il certificato HTTPS

Il container frontend non deve ancora occupare la porta 80 in questo momento (se hai già lanciato
`prod.sh` in precedenza sullo stesso server, fermalo prima: `docker compose -f docker-compose.yml
-f docker-compose.prod.yml stop frontend`).

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone \
  -d <il-tuo-ip-con-i-trattini>.nip.io \
  --non-interactive --agree-tos \
  -m <la-tua-email>
```

Certbot avvia temporaneamente un suo mini-server sulla porta 80 per dimostrare a Let's Encrypt
che controlli davvero quell'indirizzo (metodo di validazione HTTP-01: Let's Encrypt genera un
codice, lo cerca a un URL specifico su quel dominio, e se lo trova la prova è fatta), poi lo
richiude. Il certificato viene salvato in `/etc/letsencrypt/live/<dominio>/` e si rinnova
automaticamente da solo (certbot configura un task schedulato all'installazione) — valido 90
giorni, ben più del tempo di un esame.

Se ottieni un errore di timeout/connessione durante la validazione, la causa quasi sempre è il
Security Group: verifica che la regola per la porta 80 sia impostata su "Ovunque"
(`0.0.0.0/0`), non "Il mio IP" — Let's Encrypt valida da propri server esterni, non dal tuo
indirizzo.

### 5. Aggiorna il CORS del bucket S3

Dalla Console AWS (browser) → S3 → il tuo bucket → Permissions → Cross-origin resource sharing
(CORS) → Edit: aggiungi `https://<il-tuo-ip-con-i-trattini>.nip.io` all'array `AllowedOrigins`
(senza rimuovere gli eventuali indirizzi locali già presenti, per continuare a poter testare
anche in locale).

### 6. Avvia tutto

```bash
cd ~/bugboard26
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml up -d --build
```

`docker-compose.https.yml` è un terzo file, aggiuntivo rispetto a quelli usati in locale (non
sostituisce `docker-compose.prod.yml`, lo estende): fa sì che nginx (il servizio `frontend`)
ascolti su 80 (redirect automatico a HTTPS) e 443 (TLS, con i certificati montati dall'host),
**e fa da reverse proxy per le chiamate `/api/*` verso il backend** — frontend e backend
diventano così la stessa origine agli occhi del browser, eliminando sia CORS sia i problemi di
cookie cross-origin che si avrebbero con porte separate.

Verifica lo stato:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml ps
```
`frontend` deve mostrare le porte `0.0.0.0:80->80/tcp` e `0.0.0.0:443->443/tcp`.

### 7. Migration e seed admin

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml exec backend npx sequelize-cli db:migrate
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml exec backend npm run seed:admin
```

Se una migration introduce un vincolo di unicità (es. `unique` su una colonna) e il database ha
già dati che lo violano, la migration fallirà: va risolto il dato duplicato manualmente prima di
rilanciarla (vedi "Problemi comuni" più sotto).

### 8. Verifica

Apri `https://<il-tuo-ip-con-i-trattini>.nip.io` dal browser — lucchetto HTTPS valido, nessun
avviso di sicurezza. Login con le credenziali admin stampate dal seed (di default
`admin@bugboard26.local`, cambiala subito dopo il primo accesso obbligatorio).

### Aggiornare il deploy dopo nuove modifiche

Ogni volta che fai `git pull` sul server, ricordati che le immagini prod sono istantanee
congelate (vedi nota nella Modalità 2 sopra) — **serve sempre un rebuild esplicito**:
```bash
cd ~/bugboard26
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml exec backend npx sequelize-cli db:migrate
```
Se il pull ha toccato solo `backend/` o solo `frontend/`, puoi limitare il rebuild al singolo
servizio (più veloce): `... up -d --build backend` oppure `... up -d --build frontend`.

### Rimuovere il deploy

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml down -v
```
Per risparmiare, se non ti serve un accesso continuativo: ferma l'istanza EC2 da Console AWS
quando non ti serve (l'Elastic IP resta associato e stabile a costo trascurabile) e riavviala
solo quando ti serve mostrare l'app — i comandi sopra restano validi a ogni riavvio, non serve
rifare da capo certificato o configurazione.

---

## Problemi comuni

- **`password authentication failed for user "postgres"`**: Postgres inizializza la password
  solo alla primissima creazione del volume dati. Se cambi `POSTGRES_PASSWORD` dopo che il
  volume esiste già, non ha effetto finché non lo ricrei (`reset.cmd`/`reset.sh`, oppure
  `docker compose down -v`).
- **`relation "utenti" does not exist`** (o altre tabelle): il database è vuoto — rilancia
  `migrate.cmd`/`migrate.sh` (locale) o `migrate-prod.cmd`/`migrate-prod.sh` (produzione).
- **Una nuova migration sembra non fare nulla** (`No migrations were executed, database schema
  was already up to date`) **in modalità produzione**: quasi certamente il container backend è
  ancora quello buildato prima che la migration fosse aggiunta al codice — le immagini prod non
  vedono i file aggiunti dopo la build. Ricostruisci prima di migrare:
  `docker compose ... up -d --build backend`, poi rilancia la migration.
- **Una migration con un vincolo `unique` fallisce** (`column "x" ... already exists` o simile,
  oppure un errore di violazione del vincolo): il database ha già dati duplicati su quella
  colonna, creati prima che il vincolo esistesse. Va risolto il duplicato a mano prima di
  rilanciare la migration, es.:
  ```sql
  SELECT id, <colonna> FROM <tabella> ORDER BY id;
  UPDATE <tabella> SET <colonna> = '<nuovo-valore-univoco>' WHERE id = <id-del-duplicato>;
  ```
- **Una modifica al frontend non si vede dopo un `git pull`, in modalità produzione**: stesso
  principio delle migration — il container frontend serve ancora il vecchio bundle Angular
  compilato. Ricostruisci: `docker compose ... up -d --build frontend`, poi ricarica la pagina
  con hard refresh (`Ctrl+F5`) per scartare anche l'eventuale cache del browser.
- **`UsernameExistsException` creando un utente/admin**: l'account esiste già su AWS Cognito
  (servizio esterno, non toccato da un reset locale). Gestito automaticamente sia per l'admin di
  default sia per la creazione utenti da interfaccia — se persistono righe orfane su Postgres per
  utenti già cancellati da Cognito, vanno ripulite manualmente (vedi documentazione, §2.2).
- **Login riuscito ma "impossibile recuperare i dati utente"**, su un deploy con IP pubblico e
  HTTP semplice (non HTTPS): il cookie di sessione (`Secure` di default) non viene inviato dal
  browser su connessioni non cifrate verso un IP reale — vedi la sezione Deploy sopra per la
  soluzione corretta (HTTPS), o in alternativa `COOKIE_SECURE=false` in `backend/.env` come
  soluzione temporanea (vedi commento in `.env.example`).
- **Container `backend` uscito subito dopo l'avvio (`Exited`), con `ECONNREFUSED` verso
  Postgres nei log**: classico problema di sequenza d'avvio — Postgres non era ancora pronto ad
  accettare connessioni nel momento esatto in cui il backend ha tentato la prima volta (accade
  tipicamente al primissimo avvio dopo un reset, quando Postgres deve inizializzare l'intero
  volume dati). Basta far ripartire solo il backend, ora che Postgres è sicuramente pronto:
  `docker compose ... up -d backend`.
- **Certbot fallisce con `Timeout during connect (likely firewall problem)`**: il Security Group
  non lascia passare la porta 80 da internet — verifica che l'origine sia "Ovunque" (`0.0.0.0/0`),
  non "Il mio IP" (Let's Encrypt valida da propri server esterni).
- **Una porta continua a rispondere pubblicamente anche dopo averla "tolta" da un file
  compose aggiuntivo** (es. `ports: []` in un override): non funziona — Docker Compose unisce le
  liste `ports` tra i vari file, non le sostituisce. Va chiusa a un livello più a monte: il
  Security Group su AWS (o `ufw`/il firewall del sistema, su un server generico).

## Documentazione

La documentazione completa di progetto (specifica dei requisiti, design, testing) si trova in
`docs/`.