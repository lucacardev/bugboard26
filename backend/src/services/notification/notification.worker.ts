// services/notification/notification.worker.ts

import { Worker } from 'bullmq';
import { connessioneRedis } from '../../config/redis';
import { JobNotifica } from './notification.queue';
import { NotificationService } from './notification.service';
import { NotificationRepository } from '../../repositories/notification/notification.repository';

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

export const workerNotifiche = new Worker<JobNotifica>(
  'notifiche',
  async (job) => {
    const { destinatarioId, messaggio, issueId } = job.data;
    await notificationService.registraNotifica(destinatarioId, messaggio, issueId);
    console.log(`Notifica registrata per utente #${destinatarioId}: "${messaggio}"`);
  },
  { connection: connessioneRedis }
);

workerNotifiche.on('failed', (job, errore) => {
  console.error(`Job notifica #${job?.id} fallito:`, errore);
});