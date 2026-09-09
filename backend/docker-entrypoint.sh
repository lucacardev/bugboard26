#!/bin/sh
set -e

echo "Esecuzione migration Sequelize..."
npx sequelize-cli db:migrate

echo "Verifica/creazione admin di default..."
node dist/seeders/seed-admin.js

echo "Avvio applicazione..."
exec node dist/index.js
