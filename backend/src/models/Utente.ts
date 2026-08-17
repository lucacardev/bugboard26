import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Utente extends Model {
  declare id: number;
  declare cognitoSub: string;
  declare nome: string;
  declare email: string;
}

Utente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cognitoSub: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'utenti',
    timestamps: true,
  }
);