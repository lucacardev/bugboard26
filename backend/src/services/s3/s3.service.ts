// services/s3/s3.service.ts

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

const SCADENZA_URL_SECONDI = 300; // 5 minuti: tempo massimo per completare l'upload/download

export class S3Service {
  /**
   * Genera un URL temporaneo che autorizza UN upload, verso UNA chiave
   * specifica, valido solo per pochi minuti (presigned URL, PUT).
   */
  async generaUrlCaricamento(urlKey: string, tipoMime: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: urlKey,
      ContentType: tipoMime,
    });
    return getSignedUrl(s3Client, command, { expiresIn: SCADENZA_URL_SECONDI });
  }

  /**
   * Genera un URL temporaneo che autorizza UN download di un oggetto
   * esistente (presigned URL, GET).
   */
  async generaUrlDownload(urlKey: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: urlKey });
    return getSignedUrl(s3Client, command, { expiresIn: SCADENZA_URL_SECONDI });
  }

  async eliminaOggetto(urlKey: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: urlKey });
    await s3Client.send(command);
  }
}