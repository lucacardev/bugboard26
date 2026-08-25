// services/attachment/attachment.service.ts

import { randomUUID } from 'crypto';
import { AttachmentRepository } from '../../repositories/attachment/attachment.repository';
import { S3Service } from '../s3/s3.service';
import { Allegato } from '../../models/Allegato';

export interface RichiestaUploadAllegato {
  issueId: number;
  nomeFile: string;
  tipoMime: string;
}

export interface RispostaUploadAllegato {
  uploadUrl: string;
  urlKey: string;
}

export interface ConfermaCaricamentoAllegato {
  urlKey: string;
  nomeFile: string;
  tipoMime: string;
  dimensione: number;
  issueId: number;
}

export class AttachmentService {
  constructor(
    private attachmentRepository: AttachmentRepository,
    private s3Service: S3Service
  ) {}

  async richiediUploadUrl(dati: RichiestaUploadAllegato): Promise<RispostaUploadAllegato> {
    // Chiave univoca: organizzata per issue, con UUID per evitare collisioni
    // tra file con lo stesso nome caricati in momenti diversi.
    const urlKey = `issues/${dati.issueId}/${randomUUID()}-${dati.nomeFile}`;
    const uploadUrl = await this.s3Service.generaUrlCaricamento(urlKey, dati.tipoMime);
    return { uploadUrl, urlKey };
  }

  async confermaCaricamento(dati: ConfermaCaricamentoAllegato): Promise<Allegato> {
    return this.attachmentRepository.create(dati);
  }

  async getAllegatiIssue(issueId: number): Promise<Allegato[]> {
    return this.attachmentRepository.findByIssue(issueId);
  }

  async richiediDownloadUrl(id: number): Promise<string> {
    const allegato = await this.attachmentRepository.findById(id);
    if (!allegato) throw new Error('ALLEGATO_NON_TROVATO');
    return this.s3Service.generaUrlDownload(allegato.urlKey);
  }

  async eliminaAllegato(id: number): Promise<void> {
    const allegato = await this.attachmentRepository.findById(id);
    if (!allegato) throw new Error('ALLEGATO_NON_TROVATO');
    await this.s3Service.eliminaOggetto(allegato.urlKey);
    await this.attachmentRepository.delete(id);
  }
}