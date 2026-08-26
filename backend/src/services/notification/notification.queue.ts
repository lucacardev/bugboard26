// services/notification/notification.queue.ts

import { Queue } from 'bullmq';
import { connessioneRedis } from '../../config/redis';

export interface JobNotifica {
  destinatarioId: number;
  messaggio: string;
  issueId?: number;
}

export const codaNotifiche = new Queue<JobNotifica>('notifiche', { connection: connessioneRedis });