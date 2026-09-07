// routes/user.routes.ts

import { Router } from 'express';
import { UserController } from '../controllers/user/user.controller';
import { UserService } from '../services/user/user.service';
import { UserRepository } from '../repositories/user/user.repository';
import { CognitoService } from '../services/user/cognito.service';
import { autenticazione, soloAmministratore } from '../middlewares/auth.middleware';

const router = Router();

const userRepository = new UserRepository();
const cognitoService = new CognitoService();
const userService = new UserService(userRepository, cognitoService);
const userController = new UserController(userService);

router.post('/utenti', autenticazione, soloAmministratore, userController.creaUtente);
router.get('/utenti/:id', autenticazione, userController.getUtente);
router.get('/teams/:teamId/utenti', autenticazione, userController.getMembriTeam);
router.get('/utenti', autenticazione, soloAmministratore, userController.getTuttiGliUtenti);

export default router;