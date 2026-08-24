// repositories/team/team.repository.ts

import { Transaction, CreationAttributes } from 'sequelize';
import { Team } from '../../models/Team';

export class TeamRepository {
  async create(dati: CreationAttributes<Team>, transaction?: Transaction): Promise<Team> {
    return Team.create(dati, { transaction });
  }
}