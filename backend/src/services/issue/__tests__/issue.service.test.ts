// services/issue/__tests__/issue.service.test.ts

import { IssueService } from '../issue.service';
import { IssueRepository } from '../../../repositories/issue/issue.repository';
import { Issue } from '../../../models/Issue';
import { ObserverCronologia, EventoIssue } from '../../cronologia/observer-cronologia.interface';

function creaIssueRepositoryFinto() {
  return {
    findById: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Pick<IssueRepository, 'findById' | 'save'>> & IssueRepository;
}

function creaIssueDiTest(overrides: Partial<{ id: number; stato: 'todo' | 'in_progress' | 'done'; assegnatarioId: number | null }> = {}) {
  return Issue.build({
    id: overrides.id ?? 4,
    tipo: 'bug',
    titolo: 'Issue di test',
    descrizione: 'Descrizione di test',
    stato: overrides.stato ?? 'todo',
    progettoId: 1,
    segnalatoreId: 1,
    assegnatarioId: overrides.assegnatarioId ?? null,
  });
}

describe('IssueService.cambiaStato', () => {
  let issueRepository: ReturnType<typeof creaIssueRepositoryFinto>;
  let issueService: IssueService;
  let eventiRicevuti: EventoIssue[];

  beforeEach(() => {
    eventiRicevuti = [];
    issueRepository = creaIssueRepositoryFinto();
    issueService = new IssueService(issueRepository);

    const observerFinto: ObserverCronologia = {
      aggiorna: jest.fn(async (evento: EventoIssue) => {
        eventiRicevuti.push(evento);
      }),
    };
    issueService.attach(observerFinto);
  });

  it('lancia ISSUE_NON_TROVATA se l\'issue non esiste e non salva nulla', async () => {
    issueRepository.findById.mockResolvedValue(null);

    await expect(issueService.cambiaStato(999, 'done', 1)).rejects.toThrow('ISSUE_NON_TROVATA');
    expect(issueRepository.save).not.toHaveBeenCalled();
  });

  it('cambia lo stato, salva, e notifica gli observer con lo stato precedente corretto', async () => {
    const issueEsistente = creaIssueDiTest({ stato: 'todo' });
    issueRepository.findById.mockResolvedValue(issueEsistente);
    issueRepository.save.mockImplementation(async (issue: Issue) => issue);

    const risultato = await issueService.cambiaStato(4, 'in_progress', 7);

    expect(risultato.stato).toBe('in_progress');
    expect(issueRepository.save).toHaveBeenCalledWith(issueEsistente);
    expect(eventiRicevuti).toHaveLength(1);
    expect(eventiRicevuti[0]).toMatchObject({
      descrizione: 'Stato cambiato da "todo" a "in_progress"',
      autoreId: 7,
      statoPrecedente: 'todo',
    });
  });
});

describe('IssueService.assegnaA', () => {
  let issueRepository: ReturnType<typeof creaIssueRepositoryFinto>;
  let issueService: IssueService;
  let eventiRicevuti: EventoIssue[];

  beforeEach(() => {
    eventiRicevuti = [];
    issueRepository = creaIssueRepositoryFinto();
    issueService = new IssueService(issueRepository);

    const observerFinto: ObserverCronologia = {
      aggiorna: jest.fn(async (evento: EventoIssue) => {
        eventiRicevuti.push(evento);
      }),
    };
    issueService.attach(observerFinto);
  });

  it('lancia ISSUE_NON_TROVATA se l\'issue non esiste', async () => {
    issueRepository.findById.mockResolvedValue(null);

    await expect(issueService.assegnaA(999, 2, 1)).rejects.toThrow('ISSUE_NON_TROVATA');
  });

  it('assegna l\'issue all\'utente, salva, e notifica senza statoPrecedente', async () => {
    const issueEsistente = creaIssueDiTest({ assegnatarioId: null });
    issueRepository.findById.mockResolvedValue(issueEsistente);
    issueRepository.save.mockImplementation(async (issue: Issue) => issue);

    const risultato = await issueService.assegnaA(4, 2, 1);

    expect(risultato.assegnatarioId).toBe(2);
    expect(eventiRicevuti).toHaveLength(1);
    expect(eventiRicevuti[0]!.descrizione).toBe("Issue assegnata all'utente #2");
    expect(eventiRicevuti[0]!.statoPrecedente).toBeUndefined();
  });
});