// routes/comment.routes.ts

import { Router } from 'express';
import { CommentoController } from '../controllers/comment/comment.controller';
import { CommentoService } from '../services/comment/comment.service';
import { CommentoRepository } from '../repositories/comment/comment.repository';
import { autenticazione } from '../middlewares/auth.middleware';

const router = Router();

const commentoRepository = new CommentoRepository();
const commentoService = new CommentoService(commentoRepository);
const commentoController = new CommentoController(commentoService);

router.post('/commenti', autenticazione, commentoController.scriviCommento);
router.get('/issues/:issueId/commenti', autenticazione, commentoController.getCommentiIssue);
router.patch('/commenti/:id', autenticazione, commentoController.modificaTesto);

export default router;