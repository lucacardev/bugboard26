// controllers/attachment/attachment.controller.ts

import { Request, Response } from 'express';
import { AttachmentService } from '../../services/attachment/attachment.service';

const TIPI_MIME_CONSENTITI = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const DIMENSIONE_MASSIMA_BYTES = 10 * 1024 * 1024; // 10 MB

export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  richiediUploadUrl = async (req: Request, res: Response): Promise<void> => {
    const { issueId, nomeFile, tipoMime } = req.body;
    if (!issueId || !nomeFile || !tipoMime) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: issueId, nomeFile, tipoMime' } });
      return;
    }
    if (!TIPI_MIME_CONSENTITI.includes(tipoMime)) {
      res.status(400).json({ errore: { codice: 'TIPO_FILE_NON_CONSENTITO', messaggio: `Tipo file non consentito. Consentiti: ${TIPI_MIME_CONSENTITI.join(', ')}` } });
      return;
    }
    try {
      const risposta = await this.attachmentService.richiediUploadUrl({ issueId, nomeFile, tipoMime });
      res.status(200).json(risposta);
    } catch (errore) {
      console.error('Errore durante la generazione dell\'URL di upload:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la generazione dell\'URL di upload' } });
    }
  };

  confermaCaricamento = async (req: Request, res: Response): Promise<void> => {
    const { urlKey, nomeFile, tipoMime, dimensione, issueId } = req.body;
    if (!urlKey || !nomeFile || !tipoMime || !dimensione || !issueId) {
      res.status(400).json({ errore: { codice: 'CAMPI_OBBLIGATORI_MANCANTI', messaggio: 'Campi obbligatori mancanti: urlKey, nomeFile, tipoMime, dimensione, issueId' } });
      return;
    }
    if (dimensione > DIMENSIONE_MASSIMA_BYTES) {
      res.status(400).json({ errore: { codice: 'FILE_TROPPO_GRANDE', messaggio: `Dimensione massima consentita: ${DIMENSIONE_MASSIMA_BYTES / 1024 / 1024} MB` } });
      return;
    }
    try {
      const allegato = await this.attachmentService.confermaCaricamento({ urlKey, nomeFile, tipoMime, dimensione, issueId });
      res.status(201).json(allegato);
    } catch (errore) {
      console.error('Errore durante la conferma del caricamento:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la conferma del caricamento' } });
    }
  };

  getAllegatiIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const issueId = Number(req.params.issueId);
      const allegati = await this.attachmentService.getAllegatiIssue(issueId);
      res.status(200).json(allegati);
    } catch (errore) {
      console.error('Errore durante il recupero degli allegati:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante il recupero degli allegati' } });
    }
  };

  richiediDownloadUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const downloadUrl = await this.attachmentService.richiediDownloadUrl(id);
      res.status(200).json({ downloadUrl });
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ALLEGATO_NON_TROVATO') {
        res.status(404).json({ errore: { codice: 'ALLEGATO_NON_TROVATO', messaggio: 'Nessun allegato trovato con questo id' } });
        return;
      }
      console.error('Errore durante la generazione dell\'URL di download:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante la generazione dell\'URL di download' } });
    }
  };

  eliminaAllegato = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.attachmentService.eliminaAllegato(id);
      res.status(204).send();
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ALLEGATO_NON_TROVATO') {
        res.status(404).json({ errore: { codice: 'ALLEGATO_NON_TROVATO', messaggio: 'Nessun allegato trovato con questo id' } });
        return;
      }
      console.error('Errore durante l\'eliminazione dell\'allegato:', errore);
      res.status(500).json({ errore: { codice: 'ERRORE_INTERNO', messaggio: 'Si è verificato un errore durante l\'eliminazione dell\'allegato' } });
    }
  };
}