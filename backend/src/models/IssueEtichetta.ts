// models/IssueEtichetta.ts

import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/database';

export class IssueEtichetta extends Model<InferAttributes<IssueEtichetta>, InferCreationAttributes<IssueEtichetta>> {
  declare id: CreationOptional<number>;
  declare issueId: number;
  declare etichettaId: number;
}

IssueEtichetta.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    issueId: { type: DataTypes.INTEGER, allowNull: false },
    etichettaId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'issue_etichette',
    timestamps: true,
    indexes: [{ unique: true, fields: ['issueId', 'etichettaId'] }],
  }
);