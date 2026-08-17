import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class VoceCronologia extends Model {
  declare id: number;
  declare descrizione: string; // es. "Stato cambiato da 'todo' a 'in_progress'"
  declare issueId: number;
  declare autoreId: number;
}

VoceCronologia.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descrizione: { type: DataTypes.TEXT, allowNull: false },
    issueId: { type: DataTypes.INTEGER, allowNull: false },
    autoreId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'voci_cronologia',
    timestamps: true, // niente campo dataEvento esplicito: usa createdAt (già deciso)
  }
);