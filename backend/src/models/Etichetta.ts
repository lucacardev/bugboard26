// models/Etichetta.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class Etichetta extends Model<InferAttributes<Etichetta>, InferCreationAttributes<Etichetta>> {
  declare id: CreationOptional<number>;
  declare testo: string;
  declare colore: string;
  declare progettoId: number;

  modificaColore(nuovoColore: string): void {
    this.colore = nuovoColore;
  }
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
    indexes: [{ unique: true, fields: ['progettoId', 'testo'] }],
  }
);