// models/Allegato.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class Allegato extends Model<InferAttributes<Allegato>, InferCreationAttributes<Allegato>> {
  declare id: CreationOptional<number>;
  declare urlKey: string;
  declare nomeFile: string;
  declare tipoMime: string;
  declare dimensione: number;
  declare issueId: number;
  declare caricatoDa: CreationOptional<number | null>;
}

Allegato.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    urlKey: { type: DataTypes.STRING, allowNull: false },
    nomeFile: { type: DataTypes.STRING, allowNull: false },
    tipoMime: { type: DataTypes.STRING, allowNull: false },
    dimensione: { type: DataTypes.INTEGER, allowNull: false },
    issueId: { type: DataTypes.INTEGER, allowNull: false },
    // Nullable per compatibilità con allegati caricati prima dell'introduzione
    // di questo campo (vedi migration): un allegato senza caricatore noto
    // resta eliminabile solo da un amministratore.
    caricatoDa: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: 'allegati',
    timestamps: true,
  }
);