// repositories/label/label.repository.ts

import { CreationAttributes, Op, fn, col, where as sequelizeWhere } from 'sequelize';
import { Etichetta } from '../../models/Etichetta';
import { IssueEtichetta } from '../../models/IssueEtichetta';
import { Issue } from '../../models/Issue';

export class LabelRepository {
  async findById(id: number): Promise<Etichetta | null> {
    return Etichetta.findByPk(id);
  }

  async findByProgetto(progettoId: number): Promise<Etichetta[]> {
    return Etichetta.findAll({ where: { progettoId } });
  }

  /**
   * Cerca un'etichetta per testo all'interno di un progetto, ignorando
   * maiuscole/minuscole (punto 10 traccia: etichette case-insensitive).
   * L'indice unique su (progettoId, testo) è case-sensitive: questo
   * controllo va sempre fatto dal Service PRIMA di chiamare create().
   */
  async findByTestoProgetto(progettoId: number, testo: string): Promise<Etichetta | null> {
    return Etichetta.findOne({
      where: {
        [Op.and]: [
          { progettoId },
          sequelizeWhere(fn('lower', col('testo')), testo.toLowerCase()),
        ],
      },
    });
  }

  async create(dati: CreationAttributes<Etichetta>): Promise<Etichetta> {
    return Etichetta.create(dati);
  }

  async save(etichetta: Etichetta): Promise<Etichetta> {
    return etichetta.save();
  }

  async findByIssue(issueId: number): Promise<Etichetta[]> {
    const issue = await Issue.findByPk(issueId, {
        include: [{ model: Etichetta, as: 'etichette', through: { attributes: [] } }],
    });
    return issue ? (issue as any).etichette ?? [] : [];
  }

  async associaAIssue(issueId: number, etichettaId: number): Promise<IssueEtichetta> {
    return IssueEtichetta.create({ issueId, etichettaId });
  }

  async rimuoviDaIssue(issueId: number, etichettaId: number): Promise<void> {
    await IssueEtichetta.destroy({ where: { issueId, etichettaId } });
  }
}