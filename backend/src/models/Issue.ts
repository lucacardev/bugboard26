import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export type TipoIssue = 'bug' | 'question' | 'documentation' | 'feature';
export type StatoIssue = 'todo' | 'in_progress' | 'done';

export class Issue extends Model<InferAttributes<Issue>, InferCreationAttributes<Issue>> {
  declare id: CreationOptional<number>;
  declare tipo: TipoIssue;
  declare titolo: string;
  declare descrizione: string;
  declare stato: CreationOptional<StatoIssue>;
  declare priorita: CreationOptional<string | null>;
  declare dataInizio: CreationOptional<Date | null>;
  declare dataScadenza: CreationOptional<Date | null>;
  declare progettoId: number;
  declare segnalatoreId: number;
  declare assegnatarioId: CreationOptional<number | null>;

  cambiaStato(nuovoStato: StatoIssue): void {
    this.stato = nuovoStato;
  }

  assegnaA(utenteId: number): void {
    this.assegnatarioId = utenteId;
  }
}

Issue.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: { type: DataTypes.ENUM('bug', 'question', 'documentation', 'feature'), allowNull: false },
    titolo: { type: DataTypes.STRING, allowNull: false },
    descrizione: { type: DataTypes.TEXT, allowNull: true }, // <-- da rivedere: vedi nota sotto
    stato: { type: DataTypes.ENUM('todo', 'in_progress', 'done'), allowNull: false, defaultValue: 'todo' },
    priorita: { type: DataTypes.STRING, allowNull: true },
    dataInizio: { type: DataTypes.DATE, allowNull: true },
    dataScadenza: { type: DataTypes.DATE, allowNull: true },
    progettoId: { type: DataTypes.INTEGER, allowNull: false },
    segnalatoreId: { type: DataTypes.INTEGER, allowNull: false },
    assegnatarioId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'issues', timestamps: true }
);