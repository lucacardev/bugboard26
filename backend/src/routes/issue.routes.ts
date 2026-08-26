import { Router } from 'express';
import { IssueController } from '../controllers/issue/issue.controller';
import { IssueService } from '../services/issue/issue.service';
import { IssueRepository } from '../repositories/issue/issue.repository';
import { autenticazione, soloAmministratore } from '../middlewares/auth.middleware';

const router = Router();

const issueRepository = new IssueRepository();
const issueService = new IssueService(issueRepository);
const issueController = new IssueController(issueService);

router.post('/issues', autenticazione, issueController.segnalaIssue);
router.get('/issues/:id', autenticazione, issueController.getIssue);
router.get('/progetti/:progettoId/issues', autenticazione, issueController.visualizzaIssueProgetto);
router.patch('/issues/:id/stato', autenticazione, issueController.cambiaStato);
router.patch('/issues/:id/assegnatario', autenticazione, soloAmministratore, issueController.assegnaIssue);

export default router;