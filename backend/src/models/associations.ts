// backend/src/models/associations.ts
import { Utente } from './Utente';
import { Progetto } from './Progetto';
import { Team } from './Team';
import { Issue } from './Issue';
import { Commento } from './Commento';
import { Etichetta } from './Etichetta';
import { Allegato } from './Allegato';
import { VoceCronologia } from './VoceCronologia';
import { MembroTeam } from './MembroTeam';
import { IssueEtichetta } from './IssueEtichetta';
import { Notifica } from './Notifica';

export function definisciAssociazioni() {
  // Progetto - Team (composizione 1:1)
  Progetto.hasOne(Team, { foreignKey: 'progettoId', onDelete: 'CASCADE', as: 'team' });
  Team.belongsTo(Progetto, { foreignKey: 'progettoId' });

  // Utente - Progetto (crea)
  Utente.hasMany(Progetto, { foreignKey: 'creatoDa' });
  Progetto.belongsTo(Utente, { foreignKey: 'creatoDa' });

  // Progetto - Issue (composizione 1:N)
  Progetto.hasMany(Issue, { foreignKey: 'progettoId', onDelete: 'CASCADE', as: 'issue' });
  Issue.belongsTo(Progetto, { foreignKey: 'progettoId', as: 'progetto' });

  // Utente - Issue (segnala, 1:N obbligatoria)
  Utente.hasMany(Issue, { foreignKey: 'segnalatoreId', as: 'issueSegnalate' });
  Issue.belongsTo(Utente, { foreignKey: 'segnalatoreId', as: 'segnalatore' });

  // Utente - Issue (assegna, 0..1:N opzionale)
  Utente.hasMany(Issue, { foreignKey: 'assegnatarioId', as: 'issueAssegnate' });
  Issue.belongsTo(Utente, { foreignKey: 'assegnatarioId', as: 'assegnatario' });

  // Utente - Commento (scrive)
  Utente.hasMany(Commento, { foreignKey: 'autoreId' });
  Commento.belongsTo(Utente, { foreignKey: 'autoreId' });

  // Issue - Allegato (composizione 1:N)
  Issue.hasMany(Allegato, { foreignKey: 'issueId', onDelete: 'CASCADE' });
  Allegato.belongsTo(Issue, { foreignKey: 'issueId' });

  // Issue - VoceCronologia (composizione 1:N, min 1 gestito a livello applicativo)
  Issue.hasMany(VoceCronologia, { foreignKey: 'issueId', onDelete: 'CASCADE' });
  VoceCronologia.belongsTo(Issue, { foreignKey: 'issueId' });

  // Utente - VoceCronologia (effettua)
  Utente.hasMany(VoceCronologia, { foreignKey: 'autoreId' });
  VoceCronologia.belongsTo(Utente, { foreignKey: 'autoreId', as: 'autore' });

  // Team - Utente (membro_di, N:N tramite MembroTeam esplicito)
  Team.belongsToMany(Utente, { through: MembroTeam, foreignKey: 'teamId', otherKey: 'utenteId', as: 'membri' });
  Utente.belongsToMany(Team, { through: MembroTeam, foreignKey: 'utenteId', otherKey: 'teamId', as: 'team' });

  // Issue - Etichetta (possiede, N:N tramite IssueEtichetta esplicito)
  Issue.belongsToMany(Etichetta, { through: IssueEtichetta, foreignKey: 'issueId', otherKey: 'etichettaId', as: 'etichette' });
  Etichetta.belongsToMany(Issue, { through: IssueEtichetta, foreignKey: 'etichettaId', otherKey: 'issueId', as: 'issue' });

  // Utente - Notifica (riceve)
  Utente.hasMany(Notifica, { foreignKey: 'utenteId', onDelete: 'CASCADE' });
  Notifica.belongsTo(Utente, { foreignKey: 'utenteId' });

  // Issue - Notifica (riferimento opzionale)
  Issue.hasMany(Notifica, { foreignKey: 'issueId', onDelete: 'CASCADE' });
  Notifica.belongsTo(Issue, { foreignKey: 'issueId' });
}