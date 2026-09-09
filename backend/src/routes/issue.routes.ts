// routes/issue.routes.ts

import { Router } from 'express';
import { IssueController } from '../controllers/issue/issue.controller';
import { IssueService } from '../services/issue/issue.service';
import { IssueRepository } from '../repositories/issue/issue.repository';
import { CronologiaRepository } from '../repositories/cronologia/cronologia.repository';
import { CronologiaService } from '../services/cronologia/cronologia.service';
import { CronologiaObserver } from '../services/cronologia/cronologia.observer';
import { NotificationObserver } from '../services/notification/notification.observer';
import { TeamRepository } from '../repositories/team/team.repository';
import { UserRepository } from '../repositories/user/user.repository';
import { autenticazione, soloAmministratore, vietaStakeholder } from '../middlewares/auth.middleware';

const router = Router();

const issueRepository = new IssueRepository();
const issueService = new IssueService(issueRepository);

const cronologiaRepository = new CronologiaRepository();
const cronologiaService = new CronologiaService(cronologiaRepository);
issueService.attach(new CronologiaObserver(cronologiaService));
issueService.attach(new NotificationObserver(new TeamRepository(), new UserRepository()));

const issueController = new IssueController(issueService);

router.post('/issues', autenticazione, vietaStakeholder, issueController.segnalaIssue);
router.get('/issues/assegnate-a-me', autenticazione, issueController.getIssueAssegnateAMe);
router.get('/issues/:id', autenticazione, issueController.getIssue);
router.get('/progetti/:progettoId/issues', autenticazione, issueController.visualizzaIssueProgetto);
router.patch('/issues/:id/stato', autenticazione, vietaStakeholder, issueController.cambiaStato);
router.patch('/issues/:id/priorita', autenticazione, vietaStakeholder, issueController.cambiaPriorita);
router.patch('/issues/:id/date', autenticazione, soloAmministratore, issueController.cambiaDate);
router.patch('/issues/:id/assegnatario', autenticazione, soloAmministratore, issueController.assegnaIssue);

export default router;