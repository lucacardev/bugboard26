import { Router } from 'express';
import { IssueController } from '../controllers/issue/issue.controller';
import { IssueService } from '../services/issue/issue.service';
import { IssueRepository } from '../repositories/issue/issue.repository';

const router = Router();

const issueRepository = new IssueRepository();
const issueService = new IssueService(issueRepository);
const issueController = new IssueController(issueService);

router.post('/issues', issueController.segnalaIssue);
router.get('/issues/:id', issueController.getIssue);
router.get('/progetti/:progettoId/issues', issueController.visualizzaIssueProgetto);

export default router;