// models/Utente.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export type RuoloUtente = 'normale' | 'amministratore' | 'stakeholder';

export class Utente extends Model<InferAttributes<Utente>, InferCreationAttributes<Utente>> {
  declare id: CreationOptional<number>;
  declare cognitoSub: string;
  declare username: string;
  declare email: string;
  declare ruolo: RuoloUtente;
}

Utente.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cognitoSub: { type: DataTypes.STRING, allowNull: false, unique: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    ruolo: {
      type: DataTypes.ENUM('normale', 'amministratore', 'stakeholder'),
      allowNull: false,
      defaultValue: 'normale',
    },
  },
  {
    sequelize,
    tableName: 'utenti',
    timestamps: true,
  }
);