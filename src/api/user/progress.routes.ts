import { Router } from 'express';
import { isLoggedIn } from '../../middlewares/auth.middleware';
import { markLectureAsComplete, getCourseProgress } from './progress.controller';

const router = Router();

// Mark lecture as complete (POST /api/v1/user/progress)
router.post('/', isLoggedIn, markLectureAsComplete);

// Get course progress
router.get('/:courseId', isLoggedIn, getCourseProgress);

export default router;
