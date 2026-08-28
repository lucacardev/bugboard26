// routes/project.routes.ts

import { Router } from 'express';
import { ProgettoController } from '../controllers/project/project.controller';
import { ProgettoService } from '../services/project/project.service';
import { ProgettoRepository } from '../repositories/project/project.repository';
import { TeamRepository } from '../repositories/team/team.repository';
import { autenticazione, soloAmministratore } from '../middlewares/auth.middleware';

const router = Router();

const progettoRepository = new ProgettoRepository();
const teamRepository = new TeamRepository();
const progettoService = new ProgettoService(progettoRepository, teamRepository);
const progettoController = new ProgettoController(progettoService);

router.post('/progetti', autenticazione, soloAmministratore, progettoController.creaProgetto);
router.get('/progetti/:id', autenticazione, progettoController.getProgetto);
router.get('/utenti/:utenteId/progetti', autenticazione, progettoController.getProgettiUtente);
router.patch('/progetti/:id/nome', autenticazione, soloAmministratore, progettoController.modificaNome);
router.patch('/progetti/:id/descrizione', autenticazione, soloAmministratore, progettoController.modificaDescrizione);
router.get('/progetti', autenticazione, soloAmministratore, progettoController.getTuttiIProgetti);

export default router;