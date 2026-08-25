// repositories/attachment/attachment.repository.ts

import { CreationAttributes } from 'sequelize';
import { Allegato } from '../../models/Allegato';

export class AttachmentRepository {
  async findById(id: number): Promise<Allegato | null> {
    return Allegato.findByPk(id);
  }

  async findByIssue(issueId: number): Promise<Allegato[]> {
    return Allegato.findAll({ where: { issueId } });
  }

  async create(dati: CreationAttributes<Allegato>): Promise<Allegato> {
    return Allegato.create(dati);
  }

  async delete(id: number): Promise<void> {
    await Allegato.destroy({ where: { id } });
  }
}