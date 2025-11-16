import { Router } from 'express';
import { contactController } from './contact.controller.js';
import { validate } from '../../utils/zodErrorHandler.js';
import { contactUsSchema } from './contact.validation.js';

const router = Router();

router.post(
  '/',
  validate(contactUsSchema),
  contactController.contactUs
);

export default router;