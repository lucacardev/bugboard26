import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Commento extends Model {
  declare id: number;
  declare testo: string;
  declare issueId: number;
  declare autoreId: number;
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