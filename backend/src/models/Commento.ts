// models/Commento.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class Commento extends Model<InferAttributes<Commento>, InferCreationAttributes<Commento>> {
  declare id: CreationOptional<number>;
  declare testo: string;
  declare issueId: number;
  declare autoreId: number;

  modificaTesto(nuovoTesto: string): void {
    this.testo = nuovoTesto;
  }
}

Commento.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    testo: { type: DataTypes.TEXT, allowNull: false },
    issueId: { type: DataTypes.INTEGER, allowNull: false },
    autoreId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'commenti',
    timestamps: true,
  }
);