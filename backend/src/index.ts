import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { sequelize } from './config/database';
import { definisciAssociazioni } from './models/associations';

import issueRoutes from './routes/issue.routes';
import progettoRoutes from './routes/project.routes';

import './models/Utente';
import './models/Progetto';
import './models/Team';
import './models/Issue';
import './models/Bug';
import './models/Question';
import './models/Documentation';
import './models/Feature';
import './models/Commento';
import './models/Etichetta';
import './models/Allegato';
import './models/VoceCronologia';
import './models/MembroTeam';
import './models/IssueEtichetta';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', issueRoutes);
app.use('/api', progettoRoutes);

async function avvia() {
  try {
    definisciAssociazioni();

    await sequelize.authenticate();
    console.log('Connessione al database stabilita correttamente.');

    // NOTA: nessun sequelize.sync() qui - lo schema è gestito
    // esclusivamente tramite le migration in src/migrations/
    // (vedi npx sequelize-cli db:migrate)

    app.listen(PORT, () => {
      console.log(`Server in ascolto sulla porta ${PORT}`);
    });
  } catch (errore) {
    console.error('Errore durante l\'avvio del server:', errore);
    process.exit(1);
  }
}

avvia();