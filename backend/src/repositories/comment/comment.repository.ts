// repositories/comment/comment.repository.ts

import { CreationAttributes } from 'sequelize';
import { Commento } from '../../models/Commento';
import { Utente } from '../../models/Utente';

export class CommentoRepository {
  async findById(id: number): Promise<Commento | null> {
    return Commento.findByPk(id);
  }

  async findByIssue(issueId: number): Promise<Commento[]> {
    return Commento.findAll({
      where: { issueId },
      order: [['createdAt', 'ASC']],
      include: [{ model: Utente, as: 'autore', attributes: ['id', 'username'] }],
    });
  }

  async create(dati: CreationAttributes<Commento>): Promise<Commento> {
    return Commento.create(dati);
  }

  async save(commento: Commento): Promise<Commento> {
    return commento.save();
  }

  async delete(commento: Commento): Promise<void> {
    await commento.destroy();
  }
}