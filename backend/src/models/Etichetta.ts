import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Etichetta extends Model {
  declare id: number;
  declare testo: string;
  declare colore: string;
  declare progettoId: number; // etichette gestite a livello di progetto
}

Etichetta.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    testo: { type: DataTypes.STRING, allowNull: false },
    colore: { type: DataTypes.STRING, allowNull: false },
    progettoId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'etichette',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['progettoId', 'testo'], // non permettere due righe con la stessa combinazione esatta di progettoId e testo
        // garantisce unicità case-sensitive a livello DB;
        // la gestione case-insensitive (punto 10 traccia) va applicata
        // nel Service prima dell'INSERT (es. normalizzando in lowercase
        // o con un controllo esplicito), non esprimibile qui direttamente
      },
    ],
  }
);