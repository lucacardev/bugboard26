// routes/issue.routes.ts

import { Router } from 'express';
import { IssueController } from '../controllers/issue/issue.controller';
import { IssueService } from '../services/issue/issue.service';
import { IssueRepository } from '../repositories/issue/issue.repository';
import { CronologiaRepository } from '../repositories/cronologia/cronologia.repository';
import { CronologiaService } from '../services/cronologia/cronologia.service';
import { CronologiaObserver } from '../services/cronologia/cronologia.observer';
import { autenticazione, soloAmministratore } from '../middlewares/auth.middleware';

const router = Router();

const issueRepository = new IssueRepository();
const issueService = new IssueService(issueRepository);

// Registrazione dell'Observer (Lecture 19A): da qui in poi ogni evento
// rilevante orchestrato da IssueService genera automaticamente una
// VoceCronologia, senza che IssueService debba conoscere CronologiaService.
const cronologiaRepository = new CronologiaRepository();
const cronologiaService = new CronologiaService(cronologiaRepository);
const cronologiaObserver = new CronologiaObserver(cronologiaService);
issueService.attach(cronologiaObserver);

const issueController = new IssueController(issueService);

router.post('/issues', autenticazione, issueController.segnalaIssue);
router.get('/issues/:id', autenticazione, issueController.getIssue);
router.get('/progetti/:progettoId/issues', autenticazione, issueController.visualizzaIssueProgetto);
router.patch('/issues/:id/stato', autenticazione, issueController.cambiaStato);
router.patch('/issues/:id/assegnatario', autenticazione, soloAmministratore, issueController.assegnaIssue);

export default router;