// routes/attachment.routes.ts

import { Router } from 'express';
import { AttachmentController } from '../controllers/attachment/attachment.controller';
import { AttachmentService } from '../services/attachment/attachment.service';
import { AttachmentRepository } from '../repositories/attachment/attachment.repository';
import { S3Service } from '../services/s3/s3.service';

const router = Router();

const attachmentRepository = new AttachmentRepository();
const s3Service = new S3Service();
const attachmentService = new AttachmentService(attachmentRepository, s3Service);
const attachmentController = new AttachmentController(attachmentService);

router.post('/allegati/richiedi-upload', attachmentController.richiediUploadUrl);
router.post('/allegati', attachmentController.confermaCaricamento);
router.get('/issues/:issueId/allegati', attachmentController.getAllegatiIssue);
router.get('/allegati/:id/download', attachmentController.richiediDownloadUrl);
router.delete('/allegati/:id', attachmentController.eliminaAllegato);

export default router;