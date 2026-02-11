import { Router } from 'express';
import {
    createPastPaper,
    deletePastPaper,
    getPastPaperById,
    getPastPapersByCourse,
    addVisionSolution,
    deleteVisionSolution,
} from './pastPaper.controller';
import { authorizeRoles, isLoggedIn } from '../../middlewares/auth.middleware';
import upload from '../../middlewares/multer.middleware';
import validate from '../../middlewares/validate.middleware';
import { createPastPaperSchema, addVisionSolutionSchema } from './pastPaper.schema';

const router = Router();

router
    .route('/')
    .post(
        isLoggedIn,
        authorizeRoles('ADMIN'),
        upload.fields([
            { name: 'questionPaper', maxCount: 1 },
            { name: 'markingScheme', maxCount: 1 },
        ]),
        validate(createPastPaperSchema),
        createPastPaper
    );

router.route('/course/:courseId').get(isLoggedIn, getPastPapersByCourse);

router.route('/:id/solutions').post(isLoggedIn, authorizeRoles('ADMIN'), validate(addVisionSolutionSchema), addVisionSolution);
router.route('/:id/solutions/:solutionId').delete(isLoggedIn, authorizeRoles('ADMIN'), deleteVisionSolution);

router
    .route('/:id')
    .get(isLoggedIn, getPastPaperById)
    .delete(isLoggedIn, authorizeRoles('ADMIN'), deletePastPaper);

export default router;
