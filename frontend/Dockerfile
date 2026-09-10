FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ---- Stage finale: nginx serve solo i file statici compilati ----
# Stesso approccio già usato per StreetCats: il front-end è un bundle
# statico (HTML/CSS/JS) una volta compilato, non serve un runtime Node per
# servirlo — nginx è più leggero e più veloce di un server Node dedicato
# solo a questo scopo (NFR01, NFR10).
FROM nginx:1.27-alpine

# @angular/build:application (builder in uso, vedi angular.json) genera
# l'output client-side dentro un sottocartella "browser/", non direttamente
# in dist/frontend/ come i builder Angular più datati.
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Config nginx dedicata: necessaria perché Angular Router gestisce le rotte
# lato client (NFR14 — front-end del tutto autonomo dal back-end); senza
# questo, un reload su una rotta diversa da "/" (es. /progetti/1/issues/5)
# darebbe 404 da nginx, perché quel path non esiste come file reale su disco.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80