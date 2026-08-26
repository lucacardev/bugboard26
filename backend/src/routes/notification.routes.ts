// routes/notification.routes.ts

import { Router } from 'express';
import { NotificationController } from '../controllers/notification/notification.controller';
import { NotificationService } from '../services/notification/notification.service';
import { NotificationRepository } from '../repositories/notification/notification.repository';
import { autenticazione } from '../middlewares/auth.middleware';

const router = Router();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

router.get('/notifiche', autenticazione, notificationController.getNotificheUtente);
router.patch('/notifiche/:id/letta', autenticazione, notificationController.segnaComeLetta);

export default router;