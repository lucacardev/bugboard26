// routes/comment.routes.ts

import { Router } from 'express';
import { CommentoController } from '../controllers/comment/comment.controller';
import { CommentoService } from '../services/comment/comment.service';
import { CommentoRepository } from '../repositories/comment/comment.repository';

const router = Router();

const commentoRepository = new CommentoRepository();
const commentoService = new CommentoService(commentoRepository);
const commentoController = new CommentoController(commentoService);

router.post('/commenti', commentoController.scriviCommento);
router.get('/issues/:issueId/commenti', commentoController.getCommentiIssue);
router.patch('/commenti/:id', commentoController.modificaTesto);

export default router;