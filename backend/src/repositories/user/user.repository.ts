// repositories/user/user.repository.ts

import { CreationAttributes } from 'sequelize';
import { Utente } from '../../models/Utente';

export class UserRepository {
  async findById(id: number): Promise<Utente | null> {
    return Utente.findByPk(id);
  }

  async findByCognitoSub(cognitoSub: string): Promise<Utente | null> {
    return Utente.findOne({ where: { cognitoSub } });
  }

  async findByEmail(email: string): Promise<Utente | null> {
    return Utente.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<Utente | null> {
    return Utente.findOne({ where: { username } });
  }

  async attivaUtenteByEmail(email: string): Promise<void> {
    await Utente.update({ attivato: true }, { where: { email } });
  }

  async create(dati: CreationAttributes<Utente>): Promise<Utente> {
    return Utente.create(dati);
  }

  async findByTeam(teamId: number): Promise<Utente[]> {
    return Utente.findAll({
      include: [
        {
          association: 'team',
          where: { id: teamId },
          attributes: [],
        },
      ],
    });
  }

  async findAll() { 
    return Utente.findAll(); 
  }
}