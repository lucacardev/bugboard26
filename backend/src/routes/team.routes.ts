// routes/team.routes.ts

import { Router } from 'express';
import { TeamController } from '../controllers/team/team.controller';
import { TeamService } from '../services/team/team.service';
import { TeamRepository } from '../repositories/team/team.repository';
import { autenticazione, soloAmministratore } from '../middlewares/auth.middleware';

const router = Router();

const teamRepository = new TeamRepository();
const teamService = new TeamService(teamRepository);
const teamController = new TeamController(teamService);

router.get('/teams/:id', autenticazione, teamController.getTeam);
router.patch('/teams/:id/nome', autenticazione, soloAmministratore, teamController.cambiaNome);
router.get('/teams/:id/membri', autenticazione, teamController.getMembri);
router.post('/teams/:id/membri', autenticazione, soloAmministratore, teamController.aggiungiMembro);
router.delete('/teams/:id/membri/:utenteId', autenticazione, soloAmministratore, teamController.rimuoviMembro);

export default router;