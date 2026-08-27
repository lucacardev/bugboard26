// services/label/label.service.ts

import { LabelRepository } from '../../repositories/label/label.repository';
import { Etichetta } from '../../models/Etichetta';

export interface DatiCreazioneEtichetta {
  testo: string;
  colore: string;
  progettoId: number;
}

export class LabelService {
  constructor(private readonly labelRepository: LabelRepository) {}

  async creaEtichetta(dati: DatiCreazioneEtichetta): Promise<Etichetta> {
    const esistente = await this.labelRepository.findByTestoProgetto(dati.progettoId, dati.testo);
    if (esistente) throw new Error('ETICHETTA_GIA_ESISTENTE');
    return this.labelRepository.create(dati);
  }

  async getEtichetta(id: number): Promise<Etichetta> {
    const etichetta = await this.labelRepository.findById(id);
    if (!etichetta) throw new Error('ETICHETTA_NON_TROVATA');
    return etichetta;
  }

  async getEtichetteProgetto(progettoId: number): Promise<Etichetta[]> {
    return this.labelRepository.findByProgetto(progettoId);
  }

  async modificaColore(id: number, nuovoColore: string): Promise<Etichetta> {
    const etichetta = await this.labelRepository.findById(id);
    if (!etichetta) throw new Error('ETICHETTA_NON_TROVATA');
    etichetta.modificaColore(nuovoColore);
    return this.labelRepository.save(etichetta);
  }

  async getEtichetteIssue(issueId: number): Promise<Etichetta[]> {
    return this.labelRepository.findByIssue(issueId);
  }

  async associaAIssue(issueId: number, etichettaId: number): Promise<void> {
    const etichetta = await this.labelRepository.findById(etichettaId);
    if (!etichetta) throw new Error('ETICHETTA_NON_TROVATA');

    try {
      await this.labelRepository.associaAIssue(issueId, etichettaId);
    } catch (errore: any) {
      if (errore.name === 'SequelizeUniqueConstraintError') {
        throw new Error('ETICHETTA_GIA_ASSOCIATA');
      }
      throw errore;
    }
  }

  async rimuoviDaIssue(issueId: number, etichettaId: number): Promise<void> {
    await this.labelRepository.rimuoviDaIssue(issueId, etichettaId);
  }
}