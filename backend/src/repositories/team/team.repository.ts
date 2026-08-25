// repositories/team/team.repository.ts

import { Transaction, CreationAttributes } from 'sequelize';
import { Team } from '../../models/Team';
import { MembroTeam } from '../../models/MembroTeam';
import { Utente } from '../../models/Utente';

export class TeamRepository {
  async findById(id: number): Promise<Team | null> {
    return Team.findByPk(id);
  }

  async findByProgettoId(progettoId: number): Promise<Team | null> {
    return Team.findOne({ where: { progettoId } });
  }

  async findMembri(teamId: number): Promise<Utente[]> {
    const team = await Team.findByPk(teamId, {
        include: [{ model: Utente, as: 'membri', through: { attributes: [] } }],
    });
    return team ? (team as any).membri ?? [] : [];
   }

  async create(dati: CreationAttributes<Team>, transaction?: Transaction): Promise<Team> {
    return Team.create(dati, { transaction });
  }

  async save(team: Team): Promise<Team> {
    return team.save();
  }

  async aggiungiMembro(teamId: number, utenteId: number): Promise<MembroTeam> {
    return MembroTeam.create({ teamId, utenteId });
  }

  async rimuoviMembro(teamId: number, utenteId: number): Promise<void> {
    await MembroTeam.destroy({ where: { teamId, utenteId } });
  }
}