import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Team extends Model {
  declare id: number;
  declare nome: string;
  declare progettoId: number; // FK verso Progetto, UNIQUE per garantire 1:1
}

Team.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    progettoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // <-- questo è ciò che garantisce la cardinalità 1:1, non 1:N
    },
  },
  {
    sequelize,
    tableName: 'teams',
    timestamps: true,
  }
);