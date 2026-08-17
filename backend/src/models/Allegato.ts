// backend/src/models/Allegato.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Allegato extends Model {
  declare id: number;
  declare urlKey: string;
  declare nomeFile: string;
  declare tipoMime: string;
  declare dimensione: number;
  declare issueId: number;
}

Allegato.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    urlKey: { type: DataTypes.STRING, allowNull: false },
    nomeFile: { type: DataTypes.STRING, allowNull: false },
    tipoMime: { type: DataTypes.STRING, allowNull: false },
    dimensione: { type: DataTypes.INTEGER, allowNull: false },
    issueId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'allegati',
    timestamps: true,
  }
);