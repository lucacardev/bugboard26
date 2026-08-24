// models/Team.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare progettoId: number; // FK verso Progetto, UNIQUE per garantire 1:1

  cambiaNome(nuovoNome: string): void {
    this.nome = nuovoNome;
  }
}

Team.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    progettoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'teams',
    timestamps: true,
  }
);