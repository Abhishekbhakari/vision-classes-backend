import { Router } from 'express';
import {
    changePassword,
    forgotPassword,
    getLoggedInUserDetails,
    loginUser,
    logoutUser,
    registerUser,
    resetPassword,
    updateUser,
    getMyCourses,
    getDailyGoals,
    markGoalComplete
} from './user.controller';
import { isLoggedIn, updateStreakMiddleware } from '../../middlewares/auth.middleware';
import upload from '../../middlewares/multer.middleware';
import validate from '../../middlewares/validate.middleware';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    updateProfileSchema,
} from './user.schema';
import progressRoutes from './progress.routes';

const router = Router();

router.post('/register', upload.single('avatar'), validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/me', isLoggedIn, updateStreakMiddleware, getLoggedInUserDetails);
router.get('/my-courses', isLoggedIn, getMyCourses);
router.post('/reset', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset/:resetToken', validate(resetPasswordSchema), resetPassword);
router.post('/change-password', isLoggedIn, validate(changePasswordSchema), changePassword);
router.put('/update/:id', isLoggedIn, upload.single('avatar'), validate(updateProfileSchema), updateUser);
router.get('/goals/daily', isLoggedIn, getDailyGoals);
router.post('/goals/complete', isLoggedIn, markGoalComplete);


// Mount progress routes under /progress
router.use('/progress', progressRoutes);

export default router;
