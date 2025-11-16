import { Router } from 'express';
import { statsController } from './stats.controller.js';
import { isLoggedIn, authorizeRoles } from '../auth/auth.middleware.js';

const router = Router();

router.get(
  '/users',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  statsController.getUserStats
);

export default router;