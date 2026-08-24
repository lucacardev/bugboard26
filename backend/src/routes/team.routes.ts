// routes/team.routes.ts

import { Router } from 'express';
import { TeamController } from '../controllers/team/team.controller';
import { TeamService } from '../services/team/team.service';
import { TeamRepository } from '../repositories/team/team.repository';

const router = Router();

const teamRepository = new TeamRepository();
const teamService = new TeamService(teamRepository);
const teamController = new TeamController(teamService);

router.get('/teams/:id', teamController.getTeam);
router.patch('/teams/:id/nome', teamController.cambiaNome);
router.get('/teams/:id/membri', teamController.getMembri);
router.post('/teams/:id/membri', teamController.aggiungiMembro);
router.delete('/teams/:id/membri/:utenteId', teamController.rimuoviMembro);

export default router;