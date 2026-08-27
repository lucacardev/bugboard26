// services/team/__tests__/team.service.test.ts

import { TeamService } from '../team.service';
import { TeamRepository } from '../../../repositories/team/team.repository';
import { Team } from '../../../models/Team';

function creaTeamRepositoryFinto() {
  return {
    findById: jest.fn(),
    aggiungiMembro: jest.fn(),
  } as unknown as jest.Mocked<Pick<TeamRepository, 'findById' | 'aggiungiMembro'>> & TeamRepository;
}

describe('TeamService.aggiungiMembro', () => {
  let teamRepository: ReturnType<typeof creaTeamRepositoryFinto>;
  let teamService: TeamService;

  beforeEach(() => {
    teamRepository = creaTeamRepositoryFinto();
    teamService = new TeamService(teamRepository);
  });

  it('lancia TEAM_NON_TROVATO se il team non esiste', async () => {
    teamRepository.findById.mockResolvedValue(null);

    await expect(teamService.aggiungiMembro(999, 5)).rejects.toThrow('TEAM_NON_TROVATO');
    expect(teamRepository.aggiungiMembro).not.toHaveBeenCalled();
  });

  it('aggiunge il membro quando il team esiste', async () => {
    const teamEsistente = Team.build({ id: 1, nome: 'Team Test', progettoId: 1 });
    teamRepository.findById.mockResolvedValue(teamEsistente);
    teamRepository.aggiungiMembro.mockResolvedValue(undefined as any);

    await teamService.aggiungiMembro(1, 5);

    expect(teamRepository.aggiungiMembro).toHaveBeenCalledWith(1, 5);
  });

  it('traduce SequelizeUniqueConstraintError in UTENTE_GIA_MEMBRO', async () => {
    const teamEsistente = Team.build({ id: 1, nome: 'Team Test', progettoId: 1 });
    teamRepository.findById.mockResolvedValue(teamEsistente);

    const erroreSequelize = new Error('Duplicate entry');
    erroreSequelize.name = 'SequelizeUniqueConstraintError';
    teamRepository.aggiungiMembro.mockRejectedValue(erroreSequelize);

    await expect(teamService.aggiungiMembro(1, 5)).rejects.toThrow('UTENTE_GIA_MEMBRO');
  });

  it('rilancia errori diversi da SequelizeUniqueConstraintError senza tradurli', async () => {
    const teamEsistente = Team.build({ id: 1, nome: 'Team Test', progettoId: 1 });
    teamRepository.findById.mockResolvedValue(teamEsistente);

    const erroreGenerico = new Error('Errore di connessione al database');
    teamRepository.aggiungiMembro.mockRejectedValue(erroreGenerico);

    await expect(teamService.aggiungiMembro(1, 5)).rejects.toThrow('Errore di connessione al database');
  });
});