// services/issue/__tests__/issue.service.test.ts

import { IssueService } from '../issue.service';
import { IssueRepository } from '../../../repositories/issue/issue.repository';
import { TeamRepository } from '../../../repositories/team/team.repository';
import { Issue } from '../../../models/Issue';
import { ObserverCronologia, EventoIssue } from '../../cronologia/observer-cronologia.interface';

function creaIssueRepositoryFinto() {
  return {
    findById: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Pick<IssueRepository, 'findById' | 'save'>> & IssueRepository;
}

function creaTeamRepositoryFinto() {
  return {
    findByProgettoId: jest.fn(),
    isMembro: jest.fn(),
  } as unknown as jest.Mocked<Pick<TeamRepository, 'findByProgettoId' | 'isMembro'>> & TeamRepository;
}

function creaIssueDiTest(
  overrides: Partial<{
    id: number;
    stato: 'todo' | 'in_progress' | 'done';
    assegnatarioId: number | null;
    progettoId: number;
  }> = {}
) {
  return Issue.build({
    id: overrides.id ?? 4,
    tipo: 'bug',
    titolo: 'Issue di test',
    descrizione: 'Descrizione di test',
    stato: overrides.stato ?? 'todo',
    progettoId: overrides.progettoId ?? 1,
    segnalatoreId: 1,
    assegnatarioId: overrides.assegnatarioId ?? null,
  });
}

function registraObserver(issueService: IssueService, eventiRicevuti: EventoIssue[]): void {
  const observerFinto: ObserverCronologia = {
    aggiorna: jest.fn(async (evento: EventoIssue) => {
      eventiRicevuti.push(evento);
    }),
  };

  issueService.attach(observerFinto);
}

describe('IssueService.segnalaIssue', () => {
  let issueRepository: ReturnType<typeof creaIssueRepositoryFinto>;
  let teamRepository: ReturnType<typeof creaTeamRepositoryFinto>;
  let issueService: IssueService;
  let eventiRicevuti: EventoIssue[];

  beforeEach(() => {
    eventiRicevuti = [];
    issueRepository = creaIssueRepositoryFinto();
    teamRepository = creaTeamRepositoryFinto();
    issueService = new IssueService(issueRepository, teamRepository);
    registraObserver(issueService, eventiRicevuti);
  });

  it('crea una issue assegnata solo se l\'assegnatario appartiene al team e notifica assegnatarioPrecedente null', async () => {
    teamRepository.findByProgettoId.mockResolvedValue({ id: 7, progettoId: 1, nome: 'Team di test' } as any);
    teamRepository.isMembro.mockResolvedValue(true);
    issueRepository.save.mockImplementation(async (issue: Issue) => issue);

    const risultato = await issueService.segnalaIssue('bug', {
      titolo: 'Bug assegnato subito',
      descrizione: 'Descrizione',
      progettoId: 1,
      segnalatoreId: 9,
      assegnatarioId: 2,
    });

    expect(teamRepository.findByProgettoId).toHaveBeenCalledWith(1);
    expect(teamRepository.isMembro).toHaveBeenCalledWith(7, 2);
    expect(risultato.assegnatarioId).toBe(2);
    expect(issueRepository.save).toHaveBeenCalledTimes(1);
    expect(eventiRicevuti).toHaveLength(1);
    expect(eventiRicevuti[0]).toMatchObject({
      descrizione: 'Issue creata',
      autoreId: 9,
      assegnatarioPrecedente: null,
    });
  });

  it('rifiuta la creazione assegnata a un utente esterno al team prima del salvataggio', async () => {
    teamRepository.findByProgettoId.mockResolvedValue({ id: 7, progettoId: 1, nome: 'Team di test' } as any);
    teamRepository.isMembro.mockResolvedValue(false);

    await expect(
      issueService.segnalaIssue('bug', {
        titolo: 'Bug',
        descrizione: 'Descrizione',
        progettoId: 1,
        segnalatoreId: 9,
        assegnatarioId: 99,
      })
    ).rejects.toThrow('ASSEGNATARIO_NON_MEMBRO');

    expect(issueRepository.save).not.toHaveBeenCalled();
    expect(eventiRicevuti).toHaveLength(0);
  });

  it('crea una issue non assegnata senza interrogare il TeamRepository', async () => {
    issueRepository.save.mockImplementation(async (issue: Issue) => issue);

    const risultato = await issueService.segnalaIssue('question', {
      titolo: 'Domanda',
      descrizione: 'Descrizione',
      progettoId: 1,
      segnalatoreId: 9,
    });

    expect(risultato.assegnatarioId).toBeNull();
    expect(teamRepository.findByProgettoId).not.toHaveBeenCalled();
    expect(teamRepository.isMembro).not.toHaveBeenCalled();
    expect(eventiRicevuti[0]!.assegnatarioPrecedente).toBeNull();
  });
});

describe('IssueService.cambiaStato', () => {
  let issueRepository: ReturnType<typeof creaIssueRepositoryFinto>;
  let teamRepository: ReturnType<typeof creaTeamRepositoryFinto>;
  let issueService: IssueService;
  let eventiRicevuti: EventoIssue[];

  beforeEach(() => {
    eventiRicevuti = [];
    issueRepository = creaIssueRepositoryFinto();
    teamRepository = creaTeamRepositoryFinto();
    issueService = new IssueService(issueRepository, teamRepository);
    registraObserver(issueService, eventiRicevuti);
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
  let teamRepository: ReturnType<typeof creaTeamRepositoryFinto>;
  let issueService: IssueService;
  let eventiRicevuti: EventoIssue[];

  beforeEach(() => {
    eventiRicevuti = [];
    issueRepository = creaIssueRepositoryFinto();
    teamRepository = creaTeamRepositoryFinto();
    issueService = new IssueService(issueRepository, teamRepository);
    registraObserver(issueService, eventiRicevuti);
  });

  it('lancia ISSUE_NON_TROVATA se l\'issue non esiste', async () => {
    issueRepository.findById.mockResolvedValue(null);

    await expect(issueService.assegnaA(999, 2, 1)).rejects.toThrow('ISSUE_NON_TROVATA');
    expect(teamRepository.findByProgettoId).not.toHaveBeenCalled();
  });

  it('rifiuta un assegnatario che non appartiene al team senza modificare o salvare la issue', async () => {
    const issueEsistente = creaIssueDiTest({ assegnatarioId: null, progettoId: 1 });
    issueRepository.findById.mockResolvedValue(issueEsistente);
    teamRepository.findByProgettoId.mockResolvedValue({ id: 7, progettoId: 1, nome: 'Team di test' } as any);
    teamRepository.isMembro.mockResolvedValue(false);

    await expect(issueService.assegnaA(4, 99, 1)).rejects.toThrow('ASSEGNATARIO_NON_MEMBRO');

    expect(issueEsistente.assegnatarioId).toBeNull();
    expect(issueRepository.save).not.toHaveBeenCalled();
    expect(eventiRicevuti).toHaveLength(0);
  });

  it('assegna l\'issue a un membro del team, salva e notifica con l\'assegnatario precedente', async () => {
    const issueEsistente = creaIssueDiTest({ assegnatarioId: null, progettoId: 1 });
    issueRepository.findById.mockResolvedValue(issueEsistente);
    teamRepository.findByProgettoId.mockResolvedValue({ id: 7, progettoId: 1, nome: 'Team di test' } as any);
    teamRepository.isMembro.mockResolvedValue(true);
    issueRepository.save.mockImplementation(async (issue: Issue) => issue);

    const risultato = await issueService.assegnaA(4, 2, 1);

    expect(teamRepository.findByProgettoId).toHaveBeenCalledWith(1);
    expect(teamRepository.isMembro).toHaveBeenCalledWith(7, 2);
    expect(risultato.assegnatarioId).toBe(2);
    expect(issueRepository.save).toHaveBeenCalledWith(issueEsistente);
    expect(eventiRicevuti).toHaveLength(1);
    expect(eventiRicevuti[0]!.descrizione).toBe("Issue assegnata all'utente #2");
    expect(eventiRicevuti[0]!.statoPrecedente).toBeUndefined();
    expect(eventiRicevuti[0]!.assegnatarioPrecedente).toBeNull();
  });

  it('de-assegna senza interrogare il TeamRepository', async () => {
    const issueEsistente = creaIssueDiTest({ assegnatarioId: 2 });
    issueRepository.findById.mockResolvedValue(issueEsistente);
    issueRepository.save.mockImplementation(async (issue: Issue) => issue);

    const risultato = await issueService.assegnaA(4, null, 1);

    expect(risultato.assegnatarioId).toBeNull();
    expect(teamRepository.findByProgettoId).not.toHaveBeenCalled();
    expect(teamRepository.isMembro).not.toHaveBeenCalled();
    expect(eventiRicevuti[0]!.assegnatarioPrecedente).toBe(2);
  });
});
