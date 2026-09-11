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
  declare attivato: CreationOptional<boolean>;
}

Utente.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cognitoSub: { type: DataTypes.STRING, allowNull: false, unique: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    ruolo: {
      type: DataTypes.ENUM('normale', 'amministratore', 'stakeholder'),
      allowNull: false,
      defaultValue: 'normale',
    },
    // true di default (coerente con la migration): diventa false solo
    // esplicitamente in UserService.creaUtente, per i nuovi utenti che
    // devono ancora completare il primo accesso.
    attivato: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'utenti',
    timestamps: true,
  }
);