import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Progetto extends Model {
  declare id: number;
  declare nome: string;
  declare descrizione: string | null;
  declare creatoDa: number; // FK verso Utente
}

Progetto.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    descrizione: { type: DataTypes.TEXT, allowNull: true },
    creatoDa: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'progetti',
    timestamps: true,
  }
);