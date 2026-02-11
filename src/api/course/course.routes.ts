import { Router } from 'express';
import {
    getAllCourses,
    createCourse,
    removeLectureFromCourse,
    addLectureToCourseById,
    addHomeworkToLecture,
    removeHomeworkFromLecture,
    getQuestionSolution,
    updateLectureNotes,
    getLecturesByCourseId,
    updateCourseById,
    deleteCourseById,
    removeQuestionFromHomework,
} from './course.controller';
import {
    authorizeRoles,
    authorizeSubscribers,
    isLoggedIn,
} from '../../middlewares/auth.middleware';
import upload from '../../middlewares/multer.middleware';
import validate from '../../middlewares/validate.middleware';
import {
    createCourseSchema,
    updateCourseSchema,
    addLectureSchema,
    addHomeworkSchema,
    updateNotesSchema,
} from './course.schema';

const router = Router();

router
    .route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,
        authorizeRoles('ADMIN'),
        upload.single('thumbnail'),
        validate(createCourseSchema),
        createCourse
    )
    .delete(isLoggedIn, authorizeRoles('ADMIN'), removeLectureFromCourse);

router.post(
    '/:id/lectures',
    isLoggedIn,
    authorizeRoles('ADMIN'),
    upload.single('lecture'),
    validate(addLectureSchema),
    addLectureToCourseById
);

router.post(
    '/:courseId/lectures/:lectureId/homeworks',
    isLoggedIn,
    authorizeRoles('ADMIN'),
    validate(addHomeworkSchema),
    addHomeworkToLecture
);

router.delete(
    '/:courseId/lectures/:lectureId/homeworks/:hwId',
    isLoggedIn,
    authorizeRoles('ADMIN'),
    removeHomeworkFromLecture
);

router.get(
    '/:courseId/lectures/:lectureId/homeworks/:hwId/questions/:questionId/solution',
    isLoggedIn,
    authorizeSubscribers,
    getQuestionSolution
);

router.put(
    '/:courseId/lectures/:lectureId/notes',
    isLoggedIn,
    authorizeRoles('ADMIN'),
    validate(updateNotesSchema),
    updateLectureNotes
);

router
    .route('/:id')
    .get(isLoggedIn, authorizeSubscribers, getLecturesByCourseId)
    .post(
        isLoggedIn,
        authorizeRoles('ADMIN'),
        upload.single('lecture'),
        validate(addLectureSchema),
        addLectureToCourseById
    )
    .put(
        isLoggedIn,
        authorizeRoles('ADMIN'),
        upload.single('thumbnail'),
        validate(updateCourseSchema),
        updateCourseById
    )
    .delete(isLoggedIn, authorizeRoles('ADMIN'), deleteCourseById);

router.delete(
    '/:courseId/lectures/:lectureId/homeworks/:hwId/questions/:questionId',
    isLoggedIn,
    authorizeRoles('ADMIN'),
    removeQuestionFromHomework
);

export default router;
