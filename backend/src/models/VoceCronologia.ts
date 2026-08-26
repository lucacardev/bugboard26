// models/VoceCronologia.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class VoceCronologia extends Model<InferAttributes<VoceCronologia>, InferCreationAttributes<VoceCronologia>> {
  declare id: CreationOptional<number>;
  declare descrizione: string; // es. "Stato cambiato da 'todo' a 'in_progress'"
  declare issueId: number;
  declare autoreId: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  // Immutabile dopo la creazione (decisione già presa): nessun metodo di
  // modifica esposto. Il campo updatedAt esiste solo perché generato dalla
  // migration originale — l'applicazione non lo tocca mai dopo l'insert iniziale.
}

VoceCronologia.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descrizione: { type: DataTypes.TEXT, allowNull: false },
    issueId: { type: DataTypes.INTEGER, allowNull: false },
    autoreId: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'voci_cronologia',
    timestamps: true,
  }
);