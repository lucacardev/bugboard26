// models/Progetto.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class Progetto extends Model<InferAttributes<Progetto>, InferCreationAttributes<Progetto>> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare descrizione: string | null;
  declare creatoDa: number; // FK verso Utente

  modificaNome(nuovoNome: string): void {
    this.nome = nuovoNome;
  }

  modificaDescrizione(nuovaDescrizione: string | null): void {
    this.descrizione = nuovaDescrizione;
  }
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