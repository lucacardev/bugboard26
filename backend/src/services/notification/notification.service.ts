// services/notification/notification.service.ts

import { NotificationRepository } from '../../repositories/notification/notification.repository';
import { Notifica } from '../../models/Notifica';

export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async registraNotifica(utenteId: number, messaggio: string, issueId?: number): Promise<Notifica> {
    return this.notificationRepository.create({ utenteId, messaggio, issueId: issueId ?? null });
  }

  async getNotificheUtente(utenteId: number): Promise<Notifica[]> {
    return this.notificationRepository.findByUtente(utenteId);
  }

  async segnaComeLetta(id: number, utenteId: number): Promise<Notifica> {
    const notifica = await this.notificationRepository.findById(id);
    if (!notifica) {
      throw new Error('NOTIFICA_NON_TROVATA');
    }
    if (notifica.utenteId !== utenteId) {
      throw new Error('NON_AUTORIZZATO');
    }
    notifica.segnaComeLetta();
    return this.notificationRepository.save(notifica);
  }
}