// routes/cronologia.routes.ts

import { Router } from 'express';
import { CronologiaController } from '../controllers/cronologia/cronologia.controller';
import { CronologiaService } from '../services/cronologia/cronologia.service';
import { CronologiaRepository } from '../repositories/cronologia/cronologia.repository';
import { IssueRepository } from '../repositories/issue/issue.repository';
import { TeamRepository } from '../repositories/team/team.repository';
import { autenticazione } from '../middlewares/auth.middleware';

const router = Router();

const cronologiaRepository = new CronologiaRepository();
const cronologiaService = new CronologiaService(cronologiaRepository);
const issueRepository = new IssueRepository();
const teamRepository = new TeamRepository();
const cronologiaController = new CronologiaController(cronologiaService, issueRepository, teamRepository);

router.get('/issues/:issueId/cronologia', autenticazione, cronologiaController.getCronologiaIssue);

export default router;