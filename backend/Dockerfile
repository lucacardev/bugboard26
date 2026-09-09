FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Stage finale: solo ciò che serve a runtime ----
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Manteniamo anche le devDependencies (include sequelize-cli, necessario per
# eseguire le migration all'avvio del container): scelta deliberata per
# semplicità/affidabilità del deploy, a fronte di un'immagine leggermente
# più pesante rispetto a un'installazione --omit=dev.
RUN npm ci

# Codice compilato
COPY --from=build /app/dist ./dist

# File richiesti da sequelize-cli a runtime (non passano da tsc, sono già
# JavaScript puro): config di connessione e migration.
COPY .sequelizerc ./
COPY src/config/config.js ./src/config/config.js
COPY src/migrations ./src/migrations

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
