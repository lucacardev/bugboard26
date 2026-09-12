import { UniqueConstraintError } from 'sequelize';
import { AttachmentService } from '../attachment.service';
import { AttachmentRepository } from '../../../repositories/attachment/attachment.repository';
import { S3Service } from '../../s3/s3.service';
import { Allegato } from '../../../models/Allegato';

function creaAttachmentRepositoryFinto() {
  return {
    create: jest.fn(),
    findByIssue: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<AttachmentRepository>;
}

function creaS3ServiceFinto() {
  return {
    generaUrlCaricamento: jest.fn(),
    verificaOggetto: jest.fn(),
    generaUrlDownload: jest.fn(),
    eliminaOggetto: jest.fn(),
  } as unknown as jest.Mocked<S3Service>;
}

describe('AttachmentService.confermaCaricamento', () => {
  let attachmentRepository: ReturnType<typeof creaAttachmentRepositoryFinto>;
  let s3Service: ReturnType<typeof creaS3ServiceFinto>;
  let service: AttachmentService;

  beforeEach(() => {
    attachmentRepository = creaAttachmentRepositoryFinto();
    s3Service = creaS3ServiceFinto();
    service = new AttachmentService(attachmentRepository, s3Service);
  });

  it('rifiuta una urlKey che non appartiene alla issue indicata', async () => {
    await expect(
      service.confermaCaricamento({
        urlKey: 'issues/99/file.png',
        nomeFile: 'file.png',
        issueId: 4,
        caricatoDa: 7,
      })
    ).rejects.toThrow('URL_KEY_NON_COHERENTE');

    expect(s3Service.verificaOggetto).not.toHaveBeenCalled();
    expect(attachmentRepository.create).not.toHaveBeenCalled();
  });

  it('rifiuta la conferma se l\'oggetto non esiste su S3', async () => {
    s3Service.verificaOggetto.mockRejectedValue(new Error('NotFound'));

    await expect(
      service.confermaCaricamento({
        urlKey: 'issues/4/file.png',
        nomeFile: 'file.png',
        issueId: 4,
        caricatoDa: 7,
      })
    ).rejects.toThrow('FILE_NON_TROVATO_SU_S3');

    expect(attachmentRepository.create).not.toHaveBeenCalled();
  });

  it('salva i metadati reali letti da S3 e non quelli dichiarati dal client', async () => {
    s3Service.verificaOggetto.mockResolvedValue({
      dimensione: 1234,
      tipoMime: 'image/png',
    });

    const allegato = Allegato.build({
      id: 10,
      urlKey: 'issues/4/file.png',
      nomeFile: 'file.png',
      issueId: 4,
      dimensione: 1234,
      tipoMime: 'image/png',
      caricatoDa: 7,
    });
    attachmentRepository.create.mockResolvedValue(allegato);

    const risultato = await service.confermaCaricamento({
      urlKey: 'issues/4/file.png',
      nomeFile: 'file.png',
      issueId: 4,
      caricatoDa: 7,
    });

    expect(attachmentRepository.create).toHaveBeenCalledWith({
      urlKey: 'issues/4/file.png',
      nomeFile: 'file.png',
      issueId: 4,
      dimensione: 1234,
      tipoMime: 'image/png',
      caricatoDa: 7,
    });
    expect(risultato).toBe(allegato);
  });

  it('traduce una violazione UNIQUE su urlKey in ALLEGATO_GIA_CONFERMATO', async () => {
    s3Service.verificaOggetto.mockResolvedValue({
      dimensione: 1234,
      tipoMime: 'image/png',
    });

    attachmentRepository.create.mockRejectedValue(
      new UniqueConstraintError({ message: 'urlKey duplicata', errors: [] })
    );

    await expect(
      service.confermaCaricamento({
        urlKey: 'issues/4/file.png',
        nomeFile: 'file.png',
        issueId: 4,
        caricatoDa: 7,
      })
    ).rejects.toThrow('ALLEGATO_GIA_CONFERMATO');
  });
});
