# BugBoard26

Piattaforma di issue tracking multi-progetto/multi-team, sviluppata come progetto d'esame di
Ingegneria del Software (A.A. 2025/2026, Prof. Starace) — Federico II, matricola N86004038.

## Struttura del repository

```
bugboard26/
├── backend/     # Node.js + Express + TypeScript + Sequelize
├── frontend/    # Angular + TypeScript
├── docs/        # Documentazione di progetto
└── docker-compose.yml
```

## Getting started (backend)

### Prerequisiti

- Node.js 20+
- Docker Desktop
- Un account AWS con un User Pool Cognito e un bucket S3 già configurati (vedi documentazione, Capitolo 2)

### 1. Clona il repository

```bash
git clone https://github.com/lucacardev/bugboard26.git
cd bugboard26
```

### 2. Avvia Redis e Postgres

```bash
docker compose up -d
```

Verifica che entrambi i servizi siano su:

```bash
docker compose ps
```

> Se preferisci usare un'istanza Postgres già installata nativamente sul tuo sistema invece di
> quella containerizzata, puoi saltare l'avvio del servizio `postgres`
> (`docker compose up -d redis`) e puntare `.env` alla tua istanza locale.

### 3. Configura le variabili d'ambiente

```bash
cd backend
cp .env.example .env
```

Compila `.env` con i tuoi valori — in particolare:
- Se usi il Postgres containerizzato al passo 2, imposta `DB_PORT=5433`, `DB_USER=postgres`,
  `DB_PASSWORD=postgres` (valori di default del servizio `postgres` in `docker-compose.yml`,
  pensati solo per lo sviluppo locale — non usare questa password in un ambiente esposto)
- Le credenziali AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) e i valori Cognito vanno
  procurati autonomamente da un account AWS con i permessi descritti nella documentazione
  (Capitolo 2, §2.2)

### 4. Installa le dipendenze ed esegui le migration

```bash
npm install
npx sequelize-cli db:migrate
```

### 5. Avvia il server in modalità sviluppo

```bash
npm run dev
```

Il server sarà disponibile su `http://localhost:3000`.

### Test automatici

```bash
npm test
```

### Build di produzione

```bash
npm run build
docker build -t bugboard26-backend .
```

## Documentazione

La documentazione completa di progetto (specifica dei requisiti, design, testing) si trova in
`docs/`.