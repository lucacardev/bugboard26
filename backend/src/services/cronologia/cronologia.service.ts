// services/cronologia/cronologia.service.ts

import { CronologiaRepository } from '../../repositories/cronologia/cronologia.repository';
import { VoceCronologia } from '../../models/VoceCronologia';

export class CronologiaService {
  constructor(private cronologiaRepository: CronologiaRepository) {}

  async registraEvento(issueId: number, descrizione: string, autoreId: number): Promise<VoceCronologia> {
    return this.cronologiaRepository.create({ issueId, descrizione, autoreId });
  }

  async getCronologiaIssue(issueId: number): Promise<VoceCronologia[]> {
    return this.cronologiaRepository.findByIssue(issueId);
  }
}