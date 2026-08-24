// models/MembroTeam.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class MembroTeam extends Model<InferAttributes<MembroTeam>, InferCreationAttributes<MembroTeam>> {
  declare id: CreationOptional<number>;
  declare teamId: number;
  declare utenteId: number;
}

MembroTeam.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    teamId: { type: DataTypes.INTEGER, allowNull: false },
    utenteId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'membri_team',
    timestamps: true,
    indexes: [{ unique: true, fields: ['teamId', 'utenteId'] }],
  }
);