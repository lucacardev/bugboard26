// seeders/seed-admin.ts
//
// Crea l'admin di default richiesto dal punto 1 della traccia ("Il sistema
// viene fornito con un account da amministratore già attivo, con credenziali
// di default"). Va eseguito una sola volta per ogni deployment (istanza di
// database + User Pool Cognito dedicati), non ripetuto tra ambienti diversi.
//
// Uso:
//   npx ts-node --files src/seeders/seed-admin.ts   (sviluppo)
//   node dist/seeders/seed-admin.js                  (dopo npm run build)
//
// Le credenziali di default vanno impostate come variabili d'ambiente
// specifiche del deployment (ADMIN_DEFAULT_EMAIL, ADMIN_DEFAULT_PASSWORD).
// I valori di fallback qui sotto sono pensati SOLO per sviluppo/demo locale:
// per un deployment reale (es. un cliente diverso), vanno sempre sovrascritti
// con credenziali dedicate a quell'istanza, comunicate fuori banda, mai
// committate nel repository.

import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/database';
import { UserRepository } from '../repositories/user/user.repository';
import { CognitoService } from '../services/user/cognito.service';

const EMAIL_DEFAULT = process.env.ADMIN_DEFAULT_EMAIL || 'admin@bugboard26.local';
const PASSWORD_DEFAULT = process.env.ADMIN_DEFAULT_PASSWORD || 'BugBoard26!Admin';
const USERNAME_DEFAULT = 'admin';

async function seedAdmin(): Promise<void> {
  await sequelize.authenticate();
  console.log('Connessione al database stabilita.');

  const userRepository = new UserRepository();
  const cognitoService = new CognitoService();

  const esistente = await userRepository.findByEmail(EMAIL_DEFAULT);
  if (esistente) {
    console.log(`Admin di default (${EMAIL_DEFAULT}) già presente: nessuna azione necessaria.`);
    return;
  }

  console.log(`Creazione admin di default (${EMAIL_DEFAULT})...`);
  const cognitoSub = await cognitoService.creaUtenteCognitoConPassword(EMAIL_DEFAULT, PASSWORD_DEFAULT);

  await userRepository.create({
    cognitoSub,
    username: USERNAME_DEFAULT,
    email: EMAIL_DEFAULT,
    ruolo: 'amministratore',
  });

  console.log('Admin di default creato con successo.');
  console.log(`  Email:    ${EMAIL_DEFAULT}`);
  console.log(`  Password: ${PASSWORD_DEFAULT} (cambio obbligatorio al primo accesso)`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((errore) => {
    console.error('Errore durante il seed dell\'admin di default:', errore);
    process.exit(1);
  });
