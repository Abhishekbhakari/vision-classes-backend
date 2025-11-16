import { Router } from 'express';
import { userController } from './user.controller.js';
import { isLoggedIn } from '../auth/auth.middleware.js';
import upload from '../../utils/multer.js';
import { validate } from '../../utils/zodErrorHandler.js';
import {
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateUserSchema,
} from './user.validation.js';

const router = Router();

router.post(
  '/register',
  upload.single('avatar'),
  validate(registerUserSchema),
  userController.register
);

router.post(
  '/login', 
  validate(loginUserSchema), 
  userController.login
);

router.post('/logout', userController.logout);

router.get('/me', isLoggedIn, userController.getLoggedInUserDetails);

// Returns courses related to the logged-in user (created or associated)
router.get('/my-courses', isLoggedIn, userController.getMyCourses);

router.post(
  '/reset', 
  validate(forgotPasswordSchema), 
  userController.forgotPassword
);

router.post(
  '/reset/:resetToken',
  validate(resetPasswordSchema),
  userController.resetPassword
);

router.post(
  '/change-password',
  isLoggedIn,
  validate(changePasswordSchema),
  userController.changePassword
);

router.put(
  '/update/:id',
  isLoggedIn,
  upload.single('avatar'),
  validate(updateUserSchema),
  userController.updateUser
);

export default router;