// controllers/attachment/attachment.controller.ts

import { Request, Response } from 'express';
import { AttachmentService } from '../../services/attachment/attachment.service';

const TIPI_MIME_CONSENTITI = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];

export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  richiediUploadUrl = async (req: Request, res: Response): Promise<void> => {
    const { issueId, nomeFile, tipoMime } = req.body;

    if (!issueId || !nomeFile || !tipoMime) {
      res.status(400).json({
        errore: {
          codice: 'CAMPI_OBBLIGATORI_MANCANTI',
          messaggio: 'Campi obbligatori mancanti: issueId, nomeFile, tipoMime',
        },
      });
      return;
    }

    if (!TIPI_MIME_CONSENTITI.includes(tipoMime)) {
      res.status(400).json({
        errore: {
          codice: 'TIPO_FILE_NON_CONSENTITO',
          messaggio: `Tipo file non consentito. Consentiti: ${TIPI_MIME_CONSENTITI.join(', ')}`,
        },
      });
      return;
    }

    try {
      const risposta = await this.attachmentService.richiediUploadUrl({ issueId, nomeFile, tipoMime });
      res.status(200).json(risposta);
    } catch (errore) {
      console.error('Errore durante la generazione dell\'URL di upload:', errore);
      res.status(500).json({
        errore: {
          codice: 'ERRORE_INTERNO',
          messaggio: 'Si è verificato un errore durante la generazione dell\'URL di upload',
        },
      });
    }
  };

  confermaCaricamento = async (req: Request, res: Response): Promise<void> => {
    const { urlKey, nomeFile, issueId } = req.body;

    if (!urlKey || !nomeFile || !issueId) {
      res.status(400).json({
        errore: {
          codice: 'CAMPI_OBBLIGATORI_MANCANTI',
          messaggio: 'Campi obbligatori mancanti: urlKey, nomeFile, issueId',
        },
      });
      return;
    }

    try {
      const allegato = await this.attachmentService.confermaCaricamento({
        urlKey,
        nomeFile,
        issueId,
        caricatoDa: req.utente!.id,
      });

      res.status(201).json(allegato);
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'FILE_NON_TROVATO_SU_S3') {
        res.status(400).json({
          errore: {
            codice: 'FILE_NON_TROVATO_SU_S3',
            messaggio: 'Il file non risulta caricato su S3. Assicurati di aver completato l\'upload prima di confermare.',
          },
        });
        return;
      }

      if (errore instanceof Error && errore.message === 'URL_KEY_NON_COHERENTE') {
        res.status(400).json({
          errore: {
            codice: 'URL_KEY_NON_COHERENTE',
            messaggio: 'La chiave S3 non appartiene alla issue indicata.',
          },
        });
        return;
      }

      if (errore instanceof Error && errore.message === 'ALLEGATO_GIA_CONFERMATO') {
        res.status(409).json({
          errore: {
            codice: 'ALLEGATO_GIA_CONFERMATO',
            messaggio: 'Questo allegato è già stato confermato in precedenza.',
          },
        });
        return;
      }

      console.error('Errore durante la conferma del caricamento:', errore);
      res.status(500).json({
        errore: {
          codice: 'ERRORE_INTERNO',
          messaggio: 'Si è verificato un errore durante la conferma del caricamento',
        },
      });
    }
  };

  getAllegatiIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const issueId = Number(req.params.issueId);
      const allegati = await this.attachmentService.getAllegatiIssue(issueId);
      res.status(200).json(allegati);
    } catch (errore) {
      console.error('Errore durante il recupero degli allegati:', errore);
      res.status(500).json({
        errore: {
          codice: 'ERRORE_INTERNO',
          messaggio: 'Si è verificato un errore durante il recupero degli allegati',
        },
      });
    }
  };

  richiediDownloadUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const downloadUrl = await this.attachmentService.richiediDownloadUrl(id);
      res.status(200).json({ downloadUrl });
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ALLEGATO_NON_TROVATO') {
        res.status(404).json({
          errore: {
            codice: 'ALLEGATO_NON_TROVATO',
            messaggio: 'Nessun allegato trovato con questo id',
          },
        });
        return;
      }

      console.error('Errore durante la generazione dell\'URL di download:', errore);
      res.status(500).json({
        errore: {
          codice: 'ERRORE_INTERNO',
          messaggio: 'Si è verificato un errore durante la generazione dell\'URL di download',
        },
      });
    }
  };

  eliminaAllegato = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      // Chi l'ha caricato oppure un amministratore può eliminare l'allegato.
      // Un allegato storico senza caricatoDa resta eliminabile solo
      // dall'amministratore.
      const allegatoEsistente = await this.attachmentService.getAllegato(id);
      const autorizzato =
        allegatoEsistente.caricatoDa === req.utente!.id || req.utente!.ruolo === 'amministratore';

      if (!autorizzato) {
        res.status(403).json({
          errore: {
            codice: 'NON_AUTORIZZATO',
            messaggio: 'Non hai caricato tu questo allegato',
          },
        });
        return;
      }

      await this.attachmentService.eliminaAllegato(id);
      res.status(204).send();
    } catch (errore) {
      if (errore instanceof Error && errore.message === 'ALLEGATO_NON_TROVATO') {
        res.status(404).json({
          errore: {
            codice: 'ALLEGATO_NON_TROVATO',
            messaggio: 'Nessun allegato trovato con questo id',
          },
        });
        return;
      }

      console.error('Errore durante l\'eliminazione dell\'allegato:', errore);
      res.status(500).json({
        errore: {
          codice: 'ERRORE_INTERNO',
          messaggio: 'Si è verificato un errore durante l\'eliminazione dell\'allegato',
        },
      });
    }
  };
}
