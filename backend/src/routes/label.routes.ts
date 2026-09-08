// routes/label.routes.ts

import { Router } from 'express';
import { LabelController } from '../controllers/label/label.controller';
import { LabelService } from '../services/label/label.service';
import { LabelRepository } from '../repositories/label/label.repository';
import { TeamRepository } from '../repositories/team/team.repository';
import { autenticazione, vietaStakeholder } from '../middlewares/auth.middleware';

const router = Router();

const labelRepository = new LabelRepository();
const teamRepository = new TeamRepository();
const labelService = new LabelService(labelRepository);
const labelController = new LabelController(labelService, teamRepository);

router.post('/etichette', autenticazione, vietaStakeholder, labelController.creaEtichetta);
router.get('/progetti/:progettoId/etichette', autenticazione, labelController.getEtichetteProgetto);
router.patch('/etichette/:id/colore', autenticazione, vietaStakeholder, labelController.modificaColore);
router.get('/issues/:issueId/etichette', autenticazione, labelController.getEtichetteIssue);
router.post('/issues/:issueId/etichette', autenticazione, vietaStakeholder, labelController.associaAIssue);
router.delete('/issues/:issueId/etichette/:etichettaId', autenticazione, vietaStakeholder, labelController.rimuoviDaIssue);

export default router;