// routes/project.routes.ts

import { Router } from 'express';
import { ProgettoController } from '../controllers/project/project.controller';
import { ProgettoService } from '../services/project/project.service';
import { ProgettoRepository } from '../repositories/project/project.repository';
import { TeamRepository } from '../repositories/team/team.repository';

const router = Router();

const progettoRepository = new ProgettoRepository();
const teamRepository = new TeamRepository();
const progettoService = new ProgettoService(progettoRepository, teamRepository);
const progettoController = new ProgettoController(progettoService);

router.post('/progetti', progettoController.creaProgetto);
router.get('/progetti/:id', progettoController.getProgetto);
router.get('/utenti/:utenteId/progetti', progettoController.getProgettiUtente);
router.patch('/progetti/:id/nome', progettoController.modificaNome);
router.patch('/progetti/:id/descrizione', progettoController.modificaDescrizione);

export default router;