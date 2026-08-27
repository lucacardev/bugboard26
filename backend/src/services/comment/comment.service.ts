// services/comment/comment.service.ts

import { CommentoRepository } from '../../repositories/comment/comment.repository';
import { Commento } from '../../models/Commento';

export interface DatiScritturaCommento {
  testo: string;
  issueId: number;
  autoreId: number;
}

export class CommentoService {
  constructor(private readonly commentoRepository: CommentoRepository) {}

  async scriviCommento(dati: DatiScritturaCommento): Promise<Commento> {
    return this.commentoRepository.create(dati);
  }

  async getCommento(id: number): Promise<Commento> {
    const commento = await this.commentoRepository.findById(id);
    if (!commento) throw new Error('COMMENTO_NON_TROVATO');
    return commento;
  }

  async getCommentiIssue(issueId: number): Promise<Commento[]> {
    return this.commentoRepository.findByIssue(issueId);
  }

  async modificaTesto(id: number, nuovoTesto: string): Promise<Commento> {
    const commento = await this.commentoRepository.findById(id);
    if (!commento) throw new Error('COMMENTO_NON_TROVATO');
    commento.modificaTesto(nuovoTesto);
    return this.commentoRepository.save(commento);
  }
}