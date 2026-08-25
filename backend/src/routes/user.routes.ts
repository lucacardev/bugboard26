// routes/user.routes.ts

import { Router } from 'express';
import { UserController } from '../controllers/user/user.controller';
import { UserService } from '../services/user/user.service';
import { UserRepository } from '../repositories/user/user.repository';

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post('/utenti', userController.creaUtente);
router.get('/utenti/:id', userController.getUtente);
router.get('/teams/:teamId/utenti', userController.getMembriTeam);

export default router;