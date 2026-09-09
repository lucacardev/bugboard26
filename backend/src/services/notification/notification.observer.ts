// services/notification/notification.observer.ts

import { ObserverCronologia, EventoIssue } from '../cronologia/observer-cronologia.interface';
import { codaNotifiche } from './notification.queue';
import { TeamRepository } from '../../repositories/team/team.repository';
import { UserRepository } from '../../repositories/user/user.repository';

export class NotificationObserver implements ObserverCronologia {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly userRepository: UserRepository
  ) {}

  async aggiorna(evento: EventoIssue): Promise<void> {
    const passatoADone = evento.statoPrecedente !== undefined && evento.statoPrecedente !== 'done' && evento.issue.stato === 'done';

    if (passatoADone) {
      await codaNotifiche.add('issue-completata', {
        destinatarioId: evento.issue.segnalatoreId,
        messaggio: `La tua issue "${evento.issue.titolo}" è stata completata`,
        issueId: evento.issue.id,
      });

      await this.notificaStakeholderCompletamento(evento);
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

  private async notificaStakeholderCompletamento(evento: EventoIssue): Promise<void> {
    const team = await this.teamRepository.findByProgettoId(evento.issue.progettoId);
    if (!team) return;

    const membri = await this.userRepository.findByTeam(team.id);
    const stakeholder = membri.filter((m) => m.ruolo === 'stakeholder');

    for (const utente of stakeholder) {
      await codaNotifiche.add('issue-completata', {
        destinatarioId: utente.id,
        messaggio: `La issue "${evento.issue.titolo}" è stata completata`,
        issueId: evento.issue.id,
      });
    }
  }
}