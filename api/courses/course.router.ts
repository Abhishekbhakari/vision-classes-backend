import { Router } from 'express';
import { courseController } from './course.controller.js';
import {
  isLoggedIn,
  authorizeRoles,
  authorizeSubscribers,
} from '../auth/auth.middleware.js';
import upload from '../../utils/multer.js';
import { validate } from '../../utils/zodErrorHandler.js';
import {
  createCourseSchema,
  updateCourseSchema,
  addLectureSchema,
  removeLectureSchema,
  addHomeworkSchema,
  removeHomeworkSchema,
  getSolutionSchema,
  updateNotesSchema,
} from './course.validation.js';

const router = Router();

// --- Main Course Routes ---
router
  .route('/')
  .get(courseController.getAllCourses)
  .post(
    isLoggedIn,
    authorizeRoles('ADMIN'),
    upload.single('thumbnail'),
    validate(createCourseSchema),
    courseController.createCourse
  )
  .delete(
    isLoggedIn,
    authorizeRoles('ADMIN'),
    validate(removeLectureSchema), // Validates query params
    courseController.removeLecture
  );

// --- Course-specific Routes (by ID) ---
router
  .route('/:id')
  .get(
    isLoggedIn,
    authorizeSubscribers,
    courseController.getLecturesByCourseId
  )
  .put(
    isLoggedIn,
    authorizeRoles('ADMIN'),
    upload.single('thumbnail'),
    validate(updateCourseSchema),
    courseController.updateCourse
  )
  .delete(isLoggedIn, authorizeRoles('ADMIN'), courseController.deleteCourse);

// --- Lecture Routes ---
router.post(
  '/:id/lectures', // This was '/:id' .post in old router, moved for clarity
  isLoggedIn,
  authorizeRoles('ADMIN'),
  upload.single('lecture'),
  validate(addLectureSchema),
  courseController.addLecture
);

// --- Homework Routes ---
router.post(
  '/:courseId/lectures/:lectureId/homeworks',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  validate(addHomeworkSchema),
  courseController.addHomework
);

router.delete(
  '/:courseId/lectures/:lectureId/homeworks/:hwId',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  validate(removeHomeworkSchema),
  courseController.removeHomework
);

// --- Question Solution Route ---
router.get(
  '/:courseId/lectures/:lectureId/homeworks/:hwId/questions/:questionId/solution',
  isLoggedIn,
  authorizeSubscribers,
  validate(getSolutionSchema),
  courseController.getQuestionSolution
);

// --- Lecture Notes Route ---
router.put(
  '/:courseId/lectures/:lectureId/notes',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  validate(updateNotesSchema),
  courseController.updateLectureNotes
);

export default router;