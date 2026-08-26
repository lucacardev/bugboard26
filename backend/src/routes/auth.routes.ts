// routes/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/auth/auth.controller';
import { CognitoService } from '../services/user/cognito.service';

const router = Router();

const cognitoService = new CognitoService();
const authController = new AuthController(cognitoService);

router.post('/auth/login', authController.login);
router.post('/auth/completa-primo-accesso', authController.completaPrimoAccesso);

export default router;