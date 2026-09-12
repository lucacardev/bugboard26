// services/attachment/attachment.service.ts

import { randomUUID } from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
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
  issueId: number;
  caricatoDa: number;
}

export class AttachmentService {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly s3Service: S3Service
  ) {}

  async richiediUploadUrl(dati: RichiestaUploadAllegato): Promise<RispostaUploadAllegato> {
    // Chiave univoca: organizzata per issue, con UUID per evitare collisioni
    // tra file con lo stesso nome caricati in momenti diversi.
    const urlKey = `issues/${dati.issueId}/${randomUUID()}-${dati.nomeFile}`;
    const uploadUrl = await this.s3Service.generaUrlCaricamento(urlKey, dati.tipoMime);
    return { uploadUrl, urlKey };
  }

  async confermaCaricamento(dati: ConfermaCaricamentoAllegato): Promise<Allegato> {
    // La chiave viene generata dal server nel formato issues/<issueId>/... .
    // Verificarne nuovamente il prefisso in conferma impedisce di ottenere
    // una URL per una issue e poi associare lo stesso oggetto S3 a un'altra.
    if (!dati.urlKey.startsWith(`issues/${dati.issueId}/`)) {
      throw new Error('URL_KEY_NON_COHERENTE');
    }

    let metadatiReali;
    try {
      metadatiReali = await this.s3Service.verificaOggetto(dati.urlKey);
    } catch {
      throw new Error('FILE_NON_TROVATO_SU_S3');
    }

    try {
      return await this.attachmentRepository.create({
        urlKey: dati.urlKey,
        nomeFile: dati.nomeFile,
        issueId: dati.issueId,
        dimensione: metadatiReali.dimensione,
        tipoMime: metadatiReali.tipoMime,
        caricatoDa: dati.caricatoDa,
      });
    } catch (errore) {
      // Il vincolo UNIQUE sul database è la protezione definitiva anche in
      // presenza di due richieste concorrenti: una sola riga può riferirsi
      // allo stesso oggetto S3.
      if (
        errore instanceof UniqueConstraintError ||
        (errore instanceof Error && errore.name === 'SequelizeUniqueConstraintError')
      ) {
        throw new Error('ALLEGATO_GIA_CONFERMATO');
      }
      throw errore;
    }
  }

  async getAllegatiIssue(issueId: number): Promise<Allegato[]> {
    return this.attachmentRepository.findByIssue(issueId);
  }

  async richiediDownloadUrl(id: number): Promise<string> {
    const allegato = await this.attachmentRepository.findById(id);
    if (!allegato) throw new Error('ALLEGATO_NON_TROVATO');
    return this.s3Service.generaUrlDownload(allegato.urlKey);
  }

  async getAllegato(id: number): Promise<Allegato> {
    const allegato = await this.attachmentRepository.findById(id);
    if (!allegato) throw new Error('ALLEGATO_NON_TROVATO');
    return allegato;
  }

  async eliminaAllegato(id: number): Promise<void> {
    const allegato = await this.attachmentRepository.findById(id);
    if (!allegato) throw new Error('ALLEGATO_NON_TROVATO');

    await this.s3Service.eliminaOggetto(allegato.urlKey);
    await this.attachmentRepository.delete(id);
  }
}
