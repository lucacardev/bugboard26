// routes/label.routes.ts

import { Router } from 'express';
import { LabelController } from '../controllers/label/label.controller';
import { LabelService } from '../services/label/label.service';
import { LabelRepository } from '../repositories/label/label.repository';

const router = Router();

const labelRepository = new LabelRepository();
const labelService = new LabelService(labelRepository);
const labelController = new LabelController(labelService);

router.post('/etichette', labelController.creaEtichetta);
router.get('/progetti/:progettoId/etichette', labelController.getEtichetteProgetto);
router.patch('/etichette/:id/colore', labelController.modificaColore);
router.get('/issues/:issueId/etichette', labelController.getEtichetteIssue);
router.post('/issues/:issueId/etichette', labelController.associaAIssue);
router.delete('/issues/:issueId/etichette/:etichettaId', labelController.rimuoviDaIssue);

export default router;