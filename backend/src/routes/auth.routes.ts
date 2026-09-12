// routes/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/auth/auth.controller';
import { CognitoService } from '../services/user/cognito.service';
import { UserRepository } from '../repositories/user/user.repository';
import { autenticazione } from '../middlewares/auth.middleware';

const router = Router();

const cognitoService = new CognitoService();
const userRepository = new UserRepository();
const authController = new AuthController(cognitoService, userRepository);

router.post('/auth/login', authController.login);
router.post('/auth/completa-primo-accesso', authController.completaPrimoAccesso);
router.post('/auth/logout', autenticazione, authController.logout);
router.get('/auth/me', autenticazione, authController.me);

export default router;