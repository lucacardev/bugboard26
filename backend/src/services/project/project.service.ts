// services/project/project.service.ts

import { sequelize } from '../../config/database';
import { ProgettoRepository } from '../../repositories/project/project.repository';
import { TeamRepository } from '../../repositories/team/team.repository';
import { Progetto } from '../../models/Progetto';

export interface DatiCreazioneProgetto {
  nome: string;
  descrizione?: string | null;
  creatoDa: number;
  nomeTeam: string;
}

export class ProgettoService {
  constructor(
    private progettoRepository: ProgettoRepository,
    private teamRepository: TeamRepository
  ) {}

  async creaProgetto(dati: DatiCreazioneProgetto): Promise<Progetto> {
    return sequelize.transaction(async (transaction) => {
      const progetto = await this.progettoRepository.create(
        {
          nome: dati.nome,
          descrizione: dati.descrizione ?? null,
          creatoDa: dati.creatoDa,
        },
        transaction
      );

      await this.teamRepository.create(
        {
          nome: dati.nomeTeam,
          progettoId: progetto.id,
        },
        transaction
      );

      return progetto;
    });
  }

  async modificaNome(id: number, nuovoNome: string): Promise<Progetto> {
    const progetto = await this.progettoRepository.findById(id);
    if (!progetto) throw new Error('PROGETTO_NON_TROVATO');
    progetto.modificaNome(nuovoNome);
    return this.progettoRepository.save(progetto);
  }

  async modificaDescrizione(id: number, nuovaDescrizione: string | null): Promise<Progetto> {
    const progetto = await this.progettoRepository.findById(id);
    if (!progetto) throw new Error('PROGETTO_NON_TROVATO');
    progetto.modificaDescrizione(nuovaDescrizione);
    return this.progettoRepository.save(progetto);
  }

  async getProgetto(id: number): Promise<Progetto> {
    const progetto = await this.progettoRepository.findById(id);
    if (!progetto) throw new Error('PROGETTO_NON_TROVATO');
    return progetto;
  }

  async getProgettiUtente(utenteId: number): Promise<Progetto[]> {
    return this.progettoRepository.findByUtente(utenteId);
  }
}