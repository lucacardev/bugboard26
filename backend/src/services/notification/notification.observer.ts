// services/notification/notification.observer.ts

import { ObserverCronologia, EventoIssue } from '../cronologia/observer-cronologia.interface';
import { codaNotifiche } from './notification.queue';

export class NotificationObserver implements ObserverCronologia {
  async aggiorna(evento: EventoIssue): Promise<void> {
    const passatoADone = evento.statoPrecedente !== undefined && evento.statoPrecedente !== 'done' && evento.issue.stato === 'done';

    if (passatoADone) {
      await codaNotifiche.add('issue-completata', {
        destinatarioId: evento.issue.segnalatoreId,
        messaggio: `La tua issue "${evento.issue.titolo}" è stata completata`,
        issueId: evento.issue.id,
      });
    }

    const appenaAssegnata =
      evento.assegnatarioPrecedente !== undefined &&
      evento.issue.assegnatarioId !== null &&
      evento.issue.assegnatarioId !== evento.assegnatarioPrecedente;

    if (appenaAssegnata) {
      await codaNotifiche.add('issue-assegnata', {
        destinatarioId: evento.issue.assegnatarioId!,
        messaggio: `Ti è stata assegnata la issue "${evento.issue.titolo}"`,
        issueId: evento.issue.id,
      });
    }
  }
}