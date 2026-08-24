// services/team/team.service.ts

import { Transaction } from 'sequelize';
import { TeamRepository } from '../../repositories/team/team.repository';
import { Team } from '../../models/Team';
import { Utente } from '../../models/Utente';

export class TeamService {
  constructor(private teamRepository: TeamRepository) {}

  async getTeam(id: number): Promise<Team> {
    const team = await this.teamRepository.findById(id);
    if (!team) throw new Error('TEAM_NON_TROVATO');
    return team;
  }

  async cambiaNome(id: number, nuovoNome: string): Promise<Team> {
    const team = await this.teamRepository.findById(id);
    if (!team) throw new Error('TEAM_NON_TROVATO');
    team.cambiaNome(nuovoNome);
    return this.teamRepository.save(team);
  }

  async getMembri(teamId: number): Promise<Utente[]> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) throw new Error('TEAM_NON_TROVATO');
    return this.teamRepository.findMembri(teamId);
  }

  async aggiungiMembro(teamId: number, utenteId: number): Promise<void> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) throw new Error('TEAM_NON_TROVATO');

    try {
      await this.teamRepository.aggiungiMembro(teamId, utenteId);
    } catch (errore: any) {
      if (errore.name === 'SequelizeUniqueConstraintError') {
        throw new Error('UTENTE_GIA_MEMBRO');
      }
      throw errore;
    }
  }

  async rimuoviMembro(teamId: number, utenteId: number): Promise<void> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) throw new Error('TEAM_NON_TROVATO');
    await this.teamRepository.rimuoviMembro(teamId, utenteId);
  }
}