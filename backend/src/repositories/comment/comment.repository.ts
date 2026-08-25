// repositories/comment/comment.repository.ts

import { CreationAttributes } from 'sequelize';
import { Commento } from '../../models/Commento';

export class CommentoRepository {
  async findById(id: number): Promise<Commento | null> {
    return Commento.findByPk(id);
  }

  async findByIssue(issueId: number): Promise<Commento[]> {
    return Commento.findAll({
      where: { issueId },
      order: [['createdAt', 'ASC']],
    });
  }

  async create(dati: CreationAttributes<Commento>): Promise<Commento> {
    return Commento.create(dati);
  }

  async save(commento: Commento): Promise<Commento> {
    return commento.save();
  }
}