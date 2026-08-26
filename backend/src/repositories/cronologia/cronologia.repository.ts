// repositories/cronologia/cronologia.repository.ts

import { CreationAttributes } from 'sequelize';
import { VoceCronologia } from '../../models/VoceCronologia';

export class CronologiaRepository {
  async create(dati: CreationAttributes<VoceCronologia>): Promise<VoceCronologia> {
    return VoceCronologia.create(dati);
  }

  async findByIssue(issueId: number): Promise<VoceCronologia[]> {
    return VoceCronologia.findAll({ where: { issueId }, order: [['createdAt', 'ASC']] });
  }
}