// services/s3/s3.service.ts

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

const SCADENZA_URL_SECONDI = 300;

export interface MetadatiOggettoS3 {
  dimensione: number;
  tipoMime: string;
}

export class S3Service {
  async generaUrlCaricamento(urlKey: string, tipoMime: string): Promise<string> {
    const command = new PutObjectCommand({ Bucket: BUCKET_NAME, Key: urlKey, ContentType: tipoMime });
    return getSignedUrl(s3Client, command, { expiresIn: SCADENZA_URL_SECONDI });
  }

  async generaUrlDownload(urlKey: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: urlKey });
    return getSignedUrl(s3Client, command, { expiresIn: SCADENZA_URL_SECONDI });
  }

  /**
   * Legge i metadati REALI di un oggetto già caricato su S3 (dimensione,
   * content-type), senza scaricarne il contenuto. Usato per verificare che
   * un upload dichiarato dal client sia effettivamente avvenuto e per non
   * fidarsi ciecamente dei valori che il client dichiara nel body.
   * Lancia un errore se l'oggetto non esiste (upload mai completato, o
   * urlKey inventata/sbagliata).
   */
  async verificaOggetto(urlKey: string): Promise<MetadatiOggettoS3> {
    const command = new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: urlKey });
    const risposta = await s3Client.send(command);
    return {
      dimensione: risposta.ContentLength ?? 0,
      tipoMime: risposta.ContentType ?? 'application/octet-stream',
    };
  }

  async eliminaOggetto(urlKey: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: urlKey });
    await s3Client.send(command);
  }
}