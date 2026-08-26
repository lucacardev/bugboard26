// models/Notifica.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class Notifica extends Model<InferAttributes<Notifica>, InferCreationAttributes<Notifica>> {
  declare id: CreationOptional<number>;
  declare utenteId: number;
  declare messaggio: string;
  declare letta: CreationOptional<boolean>;
  declare issueId: number | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  segnaComeLetta(): void {
    this.letta = true;
  }
}

Notifica.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    utenteId: { type: DataTypes.INTEGER, allowNull: false },
    messaggio: { type: DataTypes.TEXT, allowNull: false },
    letta: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    issueId: { type: DataTypes.INTEGER, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'notifiche',
    timestamps: true,
  }
);