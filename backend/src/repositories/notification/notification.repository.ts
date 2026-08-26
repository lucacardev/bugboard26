// repositories/notification/notification.repository.ts

import { CreationAttributes } from 'sequelize';
import { Notifica } from '../../models/Notifica';

export class NotificationRepository {
  async create(dati: CreationAttributes<Notifica>): Promise<Notifica> {
    return Notifica.create(dati);
  }

  async findByUtente(utenteId: number): Promise<Notifica[]> {
    return Notifica.findAll({ where: { utenteId }, order: [['createdAt', 'DESC']] });
  }

  async findById(id: number): Promise<Notifica | null> {
    return Notifica.findByPk(id);
  }

  async save(notifica: Notifica): Promise<Notifica> {
    return notifica.save();
  }
}