// services/notification/__tests__/notification.observer.test.ts

import { NotificationObserver } from '../notification.observer';
import { Issue } from '../../../models/Issue';
import { EventoIssue } from '../../cronologia/observer-cronologia.interface';

// codaNotifiche è una Queue BullMQ reale che si connette a Redis alla
// costruzione del modulo: va sostituita con un mock per isolare il test
// dall'infrastruttura, coerente con l'approccio "fake repository" già
// usato per issue.service.test.ts, label.service.test.ts, team.service.test.ts.
jest.mock('../notification.queue', () => ({
  codaNotifiche: { add: jest.fn() },
}));

import { codaNotifiche } from '../notification.queue';

// TeamRepository/UserRepository sono usati solo dal ramo di notifica agli
// stakeholder al completamento (notificaStakeholderCompletamento): un mock
// che restituisce "nessun team trovato" fa sì che quel ramo si interrompa
// subito (if (!team) return;), lasciando invariato il comportamento già
// verificato dai test esistenti, che non riguardano quella funzionalità.
const teamRepositoryFinto = { findByProgettoId: jest.fn().mockResolvedValue(null) } as any;
const userRepositoryFinto = { findByTeam: jest.fn() } as any;

function creaIssueDiTest(
  overrides: Partial<{
    id: number;
    titolo: string;
    stato: 'todo' | 'in_progress' | 'done';
    segnalatoreId: number;
    assegnatarioId: number | null;
  }> = {}
) {
  return Issue.build({
    id: overrides.id ?? 4,
    tipo: 'bug',
    titolo: overrides.titolo ?? 'Issue di test',
    descrizione: 'Descrizione di test',
    stato: overrides.stato ?? 'todo',
    progettoId: 1,
    segnalatoreId: overrides.segnalatoreId ?? 9,
    assegnatarioId: overrides.assegnatarioId ?? null,
  });
}

describe('NotificationObserver.aggiorna', () => {
  let observer: NotificationObserver;
  const codaAddFinta = codaNotifiche.add as jest.Mock;

  beforeEach(() => {
    observer = new NotificationObserver(teamRepositoryFinto, userRepositoryFinto);
    codaAddFinta.mockClear();
  });

  it('mette in coda una notifica al segnalatore quando l\'issue passa a "done"', async () => {
    const issue = creaIssueDiTest({ titolo: 'Bug critico', stato: 'done', segnalatoreId: 9 });
    const evento: EventoIssue = {
      issue,
      descrizione: 'Stato cambiato da "in_progress" a "done"',
      autoreId: 2,
      statoPrecedente: 'in_progress',
    };

    await observer.aggiorna(evento);

    expect(codaAddFinta).toHaveBeenCalledTimes(1);
    expect(codaAddFinta).toHaveBeenCalledWith('issue-completata', {
      destinatarioId: 9,
      messaggio: 'La tua issue "Bug critico" è stata completata',
      issueId: 4,
    });
  });

  it('non mette in coda nulla per un cambio di stato che non porta a "done"', async () => {
    const issue = creaIssueDiTest({ stato: 'in_progress' });
    const evento: EventoIssue = {
      issue,
      descrizione: 'Stato cambiato da "todo" a "in_progress"',
      autoreId: 2,
      statoPrecedente: 'todo',
    };

    await observer.aggiorna(evento);

    expect(codaAddFinta).not.toHaveBeenCalled();
  });

  it('non mette in coda una seconda notifica di completamento se l\'issue era già "done"', async () => {
    // Es.: un ri-salvataggio dell'issue già completata non deve
    // generare una notifica duplicata (guardia statoPrecedente !== 'done').
    const issue = creaIssueDiTest({ stato: 'done' });
    const evento: EventoIssue = {
      issue,
      descrizione: 'Issue assegnata all\'utente #5',
      autoreId: 2,
      statoPrecedente: 'done',
    };

    await observer.aggiorna(evento);

    expect(codaAddFinta).not.toHaveBeenCalled();
  });

  it('mette in coda una notifica al nuovo assegnatario quando l\'assegnazione cambia', async () => {
    const issue = creaIssueDiTest({ titolo: 'Nuovo bug', assegnatarioId: 5 });
    const evento: EventoIssue = {
      issue,
      descrizione: 'Issue assegnata all\'utente #5',
      autoreId: 2,
      assegnatarioPrecedente: null,
    };

    await observer.aggiorna(evento);

    expect(codaAddFinta).toHaveBeenCalledTimes(1);
    expect(codaAddFinta).toHaveBeenCalledWith('issue-assegnata', {
      destinatarioId: 5,
      messaggio: 'Ti è stata assegnata la issue "Nuovo bug"',
      issueId: 4,
    });
  });

  it('non notifica una "riassegnazione" alla stessa persona che ha già la issue', async () => {
    const issue = creaIssueDiTest({ assegnatarioId: 3 });
    const evento: EventoIssue = {
      issue,
      descrizione: 'Issue assegnata all\'utente #3',
      autoreId: 2,
      assegnatarioPrecedente: 3,
    };

    await observer.aggiorna(evento);

    expect(codaAddFinta).not.toHaveBeenCalled();
  });

  it('gestisce correttamente un evento di creazione issue (nessun campo precedente valorizzato)', async () => {
    const issue = creaIssueDiTest();
    const evento: EventoIssue = {
      issue,
      descrizione: 'Issue creata',
      autoreId: 9,
    };

    await observer.aggiorna(evento);

    expect(codaAddFinta).not.toHaveBeenCalled();
  });
});