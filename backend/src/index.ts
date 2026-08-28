import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { sequelize } from './config/database';
import { definisciAssociazioni } from './models/associations';

import issueRoutes from './routes/issue.routes';
import progettoRoutes from './routes/project.routes';
import teamRoutes from './routes/team.routes';
import userRoutes from './routes/user.routes';
import commentoRoutes from './routes/comment.routes';
import labelRoutes from './routes/label.routes';
import attachmentRoutes from './routes/attachment.routes';
import authRoutes from './routes/auth.routes';
import cronologiaRoutes from './routes/cronologia.routes';
import notificationRoutes from './routes/notification.routes';
import './services/notification/notification.worker'; // avvia il Worker BullMQ nello stesso processo
import cookieParser from 'cookie-parser';

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

const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  throw new Error('CORS_ORIGIN non impostata in .env');
}

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(cookieParser());

app.use(express.json());

app.use('/api', issueRoutes);
app.use('/api', progettoRoutes);
app.use('/api', teamRoutes);
app.use('/api', userRoutes);
app.use('/api', commentoRoutes);
app.use('/api', labelRoutes);
app.use('/api', attachmentRoutes);
app.use('/api', authRoutes);
app.use('/api', cronologiaRoutes);
app.use('/api', notificationRoutes);

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