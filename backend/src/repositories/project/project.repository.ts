// repositories/project/project.repository.ts

import { CreationAttributes, Transaction } from 'sequelize';
import { Progetto } from '../../models/Progetto';
import { Team } from '../../models/Team';
import { Utente } from '../../models/Utente';

export class ProgettoRepository {
  async findById(id: number): Promise<Progetto | null> {
    return Progetto.findByPk(id, {
      include: [{ model: Team }],
    });
  }

  async findByUtente(utenteId: number): Promise<Progetto[]> {
    return Progetto.findAll({
        include: [
        {
            model: Team,
            required: true,
            include: [
            {
                model: Utente,
                as: 'membri',   // <-- aggiunto, coerente con il nuovo alias su Team
                where: { id: utenteId },
                through: { attributes: [] },
            },
            ],
        },
        ],
    });
  }

  async create(dati: CreationAttributes<Progetto>, transaction?: Transaction): Promise<Progetto> {
    return Progetto.create(dati, { transaction });
  }

  async save(progetto: Progetto): Promise<Progetto> {
    return progetto.save();
  }
}