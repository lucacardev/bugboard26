// src/worker.ts
//
// Entry point dedicato al processo Worker BullMQ, separato da index.ts
// (che avvia il server Express). Prima di questa modifica il Worker girava
// nello stesso processo del backend (semplice import in index.ts) — scelta
// di partenza legittima ma non coerente con quanto dichiarato nel documento
// di design (§2.1, §2.2: Worker come componente containerizzato
// indipendente). Separarlo in un proprio processo/container riflette
// davvero quell'indipendenza: un riavvio o un crash del server HTTP non
// influenza l'elaborazione delle notifiche in coda, e viceversa.
//
// Richiede solo il modello Notifica (l'unico toccato da NotificationRepository)
// e una connessione al database attiva — non serve definisciAssociazioni()
// né il resto dei model, il Worker non fa query che attraversano relazioni.

import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './config/database';
import './models/Notifica';
import './services/notification/notification.worker';

async function avvia(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Worker: connessione al database stabilita correttamente.');
    console.log('Worker: in ascolto sulla coda "notifiche".');
  } catch (errore) {
    console.error('Worker: errore durante la connessione al database:', errore);
    process.exit(1);
  }
}

avvia();