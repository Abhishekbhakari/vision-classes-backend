// import { Router } from 'express';
// import {
//   addLectureToCourseById,
//   createCourse,
//   deleteCourseById,
//   getAllCourses,
//   getLecturesByCourseId,
//   removeLectureFromCourse,
//   updateCourseById,
// } from '../controllers/course.controller.js';
// import {
//   authorizeRoles,
//   authorizeSubscribers,
//   isLoggedIn,
// } from '../middlewares/auth.middleware.js';
// import upload from '../middlewares/multer.middleware.js';

// const router = Router();

// // , isLoggedIn, authorizeRoles("ADMIN", "USER") - middlewares

// // OLD Code
// // router.get("/", getAllCourses);
// // router.post("/", isLoggedIn, authorizeRoles("ADMIN"), createCourse);
// // router.delete(
// //   "/",
// //   isLoggedIn,
// //   authorizeRoles("ADMIN"),
// //   removeLectureFromCourse
// // );
// // router.get("/:id", isLoggedIn, getLecturesByCourseId);
// // router.post(
// //   "/:id",
// //   isLoggedIn,
// //   authorizeRoles("ADMIN"),
// //   upload.single("lecture"),
// //   addLectureToCourseById
// // );
// // router.delete("/:id", isLoggedIn, authorizeRoles("ADMIN"), deleteCourseById);

// // Refactored code
// router
//   .route('/')
//   .get(getAllCourses)
//   .post(
//     isLoggedIn,
//     authorizeRoles('ADMIN'),
//     upload.single('thumbnail'),
//     createCourse
//   )
//   .delete(isLoggedIn, authorizeRoles('ADMIN'), removeLectureFromCourse);

// router
//   .route('/:id')
//   .get(isLoggedIn, authorizeSubscribers, getLecturesByCourseId) // Added authorizeSubscribers to check if user is admin or subscribed if not then forbid the access to the lectures
//   .post(
//     isLoggedIn,
//     authorizeRoles('ADMIN'),
//     upload.single('lecture'),
//     addLectureToCourseById
//   )
//   .put(isLoggedIn, authorizeRoles('ADMIN'), updateCourseById);

// export default router;
// import { Router } from 'express';
// import {
//   addLectureToCourseById,
//   createCourse,
//   deleteCourseById,
//   getAllCourses,
//   getLecturesByCourseId,
//   removeLectureFromCourse,
//   updateCourseById,
// } from '../controllers/course.controller.js';
// import {
//   authorizeRoles,
//   authorizeSubscribers,
//   isLoggedIn,
// } from '../middlewares/auth.middleware.js';
// import upload from '../middlewares/multer.middleware.js';

// const router = Router();

// // , isLoggedIn, authorizeRoles("ADMIN", "USER") - middlewares

// // OLD Code
// // router.get("/", getAllCourses);
// // router.post("/", isLoggedIn, authorizeRoles("ADMIN"), createCourse);
// // router.delete(
// //   "/",
// //   isLoggedIn,
// //   authorizeRoles("ADMIN"),
// //   removeLectureFromCourse
// // );
// // router.get("/:id", isLoggedIn, getLecturesByCourseId);
// // router.post(
// //   "/:id",
// //   isLoggedIn,
// //   authorizeRoles("ADMIN"),
// //   upload.single("lecture"),
// //   addLectureToCourseById
// // );
// // router.delete("/:id", isLoggedIn, authorizeRoles("ADMIN"), deleteCourseById);

// // Refactored code
// router
//   .route('/')
//   .get(getAllCourses)
//   .post(
//     isLoggedIn,
//     authorizeRoles('ADMIN'),
//     upload.single('thumbnail'),
//     createCourse
//   )
//   .delete(isLoggedIn, authorizeRoles('ADMIN'), removeLectureFromCourse);

// router
//   .route('/:id')
//   .get(isLoggedIn, authorizeSubscribers, getLecturesByCourseId) // Added authorizeSubscribers to check if user is admin or subscribed if not then forbid the access to the lectures
//   .post(
//     isLoggedIn,
//     authorizeRoles('ADMIN'),
//     upload.single('lecture'),
//     addLectureToCourseById
//   )
//   .put(isLoggedIn, authorizeRoles('ADMIN'), updateCourseById);

// export default router;

import { Router } from 'express';
import {
  addLectureToCourseById,
  createCourse,
  deleteCourseById,
  getAllCourses,
  getLecturesByCourseId,
  removeLectureFromCourse,
  updateCourseById,
  // NEW controllers
  addHomeworkToLecture,
  removeHomeworkFromLecture,
  getQuestionSolution,
  updateLectureNotes,
} from '../controllers/course.controller.js';
import {
  authorizeRoles,
  authorizeSubscribers,
  isLoggedIn,
} from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

// Public / admin list/create/delete (delete kept as original query-style)
router
  .route('/')
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorizeRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
  )
  .delete(isLoggedIn, authorizeRoles('ADMIN'), removeLectureFromCourse);

// ===== Lecture-related nested routes (must come BEFORE '/:id' route) =====
// Add a lecture (video) to a course
router.post(
  '/:id/lectures',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  upload.single('lecture'),
  addLectureToCourseById
);

// HOMEWORK: add & remove
router.post(
  '/:courseId/lectures/:lectureId/homeworks',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  addHomeworkToLecture
);

router.delete(
  '/:courseId/lectures/:lectureId/homeworks/:hwId',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  removeHomeworkFromLecture
);

// Lazy-load question solution (students/subscribers can access)
router.get(
  '/:courseId/lectures/:lectureId/homeworks/:hwId/questions/:questionId/solution',
  isLoggedIn,
  authorizeSubscribers,
  getQuestionSolution
);

// NOTES: update lecture notes (admin)
router.put(
  '/:courseId/lectures/:lectureId/notes',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  updateLectureNotes
);

// ===== Existing per-course route (kept as you had it) =====
router
  .route('/:id')
  .get(isLoggedIn, authorizeSubscribers, getLecturesByCourseId) // lecture access for authorized/subscribed users
  .post(
    isLoggedIn,
    authorizeRoles('ADMIN'),
    upload.single('lecture'),
    addLectureToCourseById
  )
  .put(isLoggedIn, authorizeRoles('ADMIN'), updateCourseById);

// Optionally keep DELETE /:id for deleting course
router.delete('/:id', isLoggedIn, authorizeRoles('ADMIN'), deleteCourseById);

export default router;
