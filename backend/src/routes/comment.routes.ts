// routes/comment.routes.ts

import { Router } from 'express';
import { CommentoController } from '../controllers/comment/comment.controller';
import { CommentoService } from '../services/comment/comment.service';
import { CommentoRepository } from '../repositories/comment/comment.repository';
import { autenticazione, vietaStakeholder } from '../middlewares/auth.middleware';

const router = Router();

const commentoRepository = new CommentoRepository();
const commentoService = new CommentoService(commentoRepository);
const commentoController = new CommentoController(commentoService);

router.post('/commenti', autenticazione, vietaStakeholder, commentoController.scriviCommento);
router.get('/issues/:issueId/commenti', autenticazione, commentoController.getCommentiIssue);
router.patch('/commenti/:id', autenticazione, vietaStakeholder, commentoController.modificaTesto);
router.delete('/commenti/:id', autenticazione, vietaStakeholder, commentoController.eliminaCommento);

export default router;