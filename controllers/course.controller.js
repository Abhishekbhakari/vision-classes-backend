// // // import fs from 'fs/promises';
// // // import path from 'path';

// // // import cloudinary from 'cloudinary';

// // // import asyncHandler from '../middlewares/asyncHandler.middleware.js';
// // // import Course from '../models/course.model.js';
// // // import AppError from '../utils/AppError.js';

// // // /**
// // //  * @ALL_COURSES
// // //  * @ROUTE @GET {{URL}}/api/v1/courses
// // //  * @ACCESS Public
// // //  */
// // // export const getAllCourses = asyncHandler(async (_req, res, next) => {
// // //   // Find all the courses without lectures
// // //   const courses = await Course.find({}).select('-lectures');

// // //   res.status(200).json({
// // //     success: true,
// // //     message: 'All courses',
// // //     courses,
// // //   });
// // // });

// // // /**
// // //  * @CREATE_COURSE
// // //  * @ROUTE @POST {{URL}}/api/v1/courses
// // //  * @ACCESS Private (admin only)
// // //  */
// // // export const createCourse = asyncHandler(async (req, res, next) => {
// // //   const { title, description, category, createdBy } = req.body;

// // //   if (!title || !description || !category || !createdBy) {
// // //     return next(new AppError('All fields are required', 400));
// // //   }

// // //   const course = await Course.create({
// // //     title,
// // //     description,
// // //     category,
// // //     createdBy,
// // //   });

// // //   if (!course) {
// // //     return next(
// // //       new AppError('Course could not be created, please try again', 400)
// // //     );
// // //   }

// // //   // Run only if user sends a file
// // //   if (req.file) {
// // //     try {
// // //       const result = await cloudinary.v2.uploader.upload(req.file.path, {
// // //         folder: 'lms', // Save files in a folder named lms
// // //       });

// // //       // If success
// // //       if (result) {
// // //         // Set the public_id and secure_url in array
// // //         course.thumbnail.public_id = result.public_id;
// // //         course.thumbnail.secure_url = result.secure_url;
// // //       }

// // //       // After successful upload remove the file from local storage
// // //       fs.rm(`uploads/${req.file.filename}`);
// // //     } catch (error) {
// // //       // Empty the uploads directory without deleting the uploads directory
// // //       for (const file of await fs.readdir('uploads/')) {
// // //         await fs.unlink(path.join('uploads/', file));
// // //       }

// // //       // Send the error message
// // //       return next(
// // //         new AppError(
// // //           JSON.stringify(error) || 'File not uploaded, please try again',
// // //           400
// // //         )
// // //       );
// // //     }
// // //   }

// // //   // Save the changes
// // //   await course.save();

// // //   res.status(201).json({
// // //     success: true,
// // //     message: 'Course created successfully',
// // //     course,
// // //   });
// // // });

// // // /**
// // //  * @GET_LECTURES_BY_COURSE_ID
// // //  * @ROUTE @POST {{URL}}/api/v1/courses/:id
// // //  * @ACCESS Private(ADMIN, subscribed users only)
// // //  */
// // // export const getLecturesByCourseId = asyncHandler(async (req, res, next) => {
// // //   const { id } = req.params;

// // //   const course = await Course.findById(id);

// // //   if (!course) {
// // //     return next(new AppError('Invalid course id or course not found.', 404));
// // //   }

// // //   res.status(200).json({
// // //     success: true,
// // //     message: 'Course lectures fetched successfully',
// // //     lectures: course.lectures,
// // //   });
// // // });

// // // /**
// // //  * @ADD_LECTURE
// // //  * @ROUTE @POST {{URL}}/api/v1/courses/:id
// // //  * @ACCESS Private (Admin Only)
// // //  */
// // // export const addLectureToCourseById = asyncHandler(async (req, res, next) => {
// // //   const { title, description } = req.body;
// // //   const { id } = req.params;

// // //   let lectureData = {};

// // //   if (!title || !description) {
// // //     return next(new AppError('Title and Description are required', 400));
// // //   }

// // //   const course = await Course.findById(id);

// // //   if (!course) {
// // //     return next(new AppError('Invalid course id or course not found.', 400));
// // //   }

// // //   // Run only if user sends a file
// // //   if (req.file) {
// // //     try {
// // //       const result = await cloudinary.v2.uploader.upload(req.file.path, {
// // //         folder: 'lms', // Save files in a folder named lms
// // //         chunk_size: 50000000, // 50 mb size
// // //         resource_type: 'video',
// // //       });

// // //       // If success
// // //       if (result) {
// // //         // Set the public_id and secure_url in array
// // //         lectureData.public_id = result.public_id;
// // //         lectureData.secure_url = result.secure_url;
// // //       }

// // //       // After successful upload remove the file from local storage
// // //       fs.rm(`uploads/${req.file.filename}`);
// // //     } catch (error) {
// // //       // Empty the uploads directory without deleting the uploads directory
// // //       for (const file of await fs.readdir('uploads/')) {
// // //         await fs.unlink(path.join('uploads/', file));
// // //       }

// // //       // Send the error message
// // //       return next(
// // //         new AppError(
// // //           JSON.stringify(error) || 'File not uploaded, please try again',
// // //           400
// // //         )
// // //       );
// // //     }
// // //   }

// // //   course.lectures.push({
// // //     title,
// // //     description,
// // //     lecture: lectureData,
// // //   });

// // //   course.numberOfLectures = course.lectures.length;

// // //   // Save the course object
// // //   await course.save();

// // //   res.status(200).json({
// // //     success: true,
// // //     message: 'Course lecture added successfully',
// // //     course,
// // //   });
// // // });

// // // /**
// // //  * @Remove_LECTURE
// // //  * @ROUTE @DELETE {{URL}}/api/v1/courses/:courseId/lectures/:lectureId
// // //  * @ACCESS Private (Admin only)
// // //  */
// // // export const removeLectureFromCourse = asyncHandler(async (req, res, next) => {
// // //   // Grabbing the courseId and lectureId from req.query
// // //   const { courseId, lectureId } = req.query;

// // //   console.log(courseId);

// // //   // Checking if both courseId and lectureId are present
// // //   if (!courseId) {
// // //     return next(new AppError('Course ID is required', 400));
// // //   }

// // //   if (!lectureId) {
// // //     return next(new AppError('Lecture ID is required', 400));
// // //   }

// // //   // Find the course uding the courseId
// // //   const course = await Course.findById(courseId);

// // //   // If no course send custom message
// // //   if (!course) {
// // //     return next(new AppError('Invalid ID or Course does not exist.', 404));
// // //   }

// // //   // Find the index of the lecture using the lectureId
// // //   const lectureIndex = course.lectures.findIndex(
// // //     (lecture) => lecture._id.toString() === lectureId.toString()
// // //   );

// // //   // If returned index is -1 then send error as mentioned below
// // //   if (lectureIndex === -1) {
// // //     return next(new AppError('Lecture does not exist.', 404));
// // //   }

// // //   // Delete the lecture from cloudinary
// // //   await cloudinary.v2.uploader.destroy(
// // //     course.lectures[lectureIndex].lecture.public_id,
// // //     {
// // //       resource_type: 'video',
// // //     }
// // //   );

// // //   // Remove the lecture from the array
// // //   course.lectures.splice(lectureIndex, 1);

// // //   // update the number of lectures based on lectres array length
// // //   course.numberOfLectures = course.lectures.length;

// // //   // Save the course object
// // //   await course.save();

// // //   // Return response
// // //   res.status(200).json({
// // //     success: true,
// // //     message: 'Course lecture removed successfully',
// // //   });
// // // });

// // // /**
// // //  * @UPDATE_COURSE_BY_ID
// // //  * @ROUTE @PUT {{URL}}/api/v1/courses/:id
// // //  * @ACCESS Private (Admin only)
// // //  */
// // // export const updateCourseById = asyncHandler(async (req, res, next) => {
// // //   // Extracting the course id from the request params
// // //   const { id } = req.params;

// // //   // Finding the course using the course id
// // //   const course = await Course.findByIdAndUpdate(
// // //     id,
// // //     {
// // //       $set: req.body, // This will only update the fields which are present
// // //     },
// // //     {
// // //       runValidators: true, // This will run the validation checks on the new data
// // //     }
// // //   );

// // //   // If no course found then send the response for the same
// // //   if (!course) {
// // //     return next(new AppError('Invalid course id or course not found.', 400));
// // //   }

// // //   // Sending the response after success
// // //   res.status(200).json({
// // //     success: true,
// // //     message: 'Course updated successfully',
// // //   });
// // // });

// // // /**
// // //  * @DELETE_COURSE_BY_ID
// // //  * @ROUTE @DELETE {{URL}}/api/v1/courses/:id
// // //  * @ACCESS Private (Admin only)
// // //  */
// // // export const deleteCourseById = asyncHandler(async (req, res, next) => {
// // //   // Extracting id from the request parameters
// // //   const { id } = req.params;

// // //   // Finding the course via the course ID
// // //   const course = await Course.findById(id);

// // //   // If course not find send the message as stated below
// // //   if (!course) {
// // //     return next(new AppError('Course with given id does not exist.', 404));
// // //   }

// // //   // Remove course
// // //   await course.remove();

// // //   // Send the message as response
// // //   res.status(200).json({
// // //     success: true,
// // //     message: 'Course deleted successfully',
// // //   });
// // // });

// // import fs from 'fs/promises';
// // import path from 'path';

// // import cloudinary from 'cloudinary';

// // import asyncHandler from '../middlewares/asyncHandler.middleware.js';
// // import Course from '../models/course.model.js';
// // import AppError from '../utils/AppError.js';

// // /**
// //  * @ALL_COURSES
// //  * @ROUTE @GET {{URL}}/api/v1/courses
// //  * @ACCESS Public
// //  */
// // export const getAllCourses = asyncHandler(async (_req, res, next) => {
// //   // Find all the courses without lectures (keep it light)
// //   const courses = await Course.find({}).select('-lectures');

// //   res.status(200).json({
// //     success: true,
// //     message: 'All courses',
// //     courses,
// //   });
// // });

// // /**
// //  * @CREATE_COURSE
// //  * @ROUTE @POST {{URL}}/api/v1/courses
// //  * @ACCESS Private (admin only)
// //  */
// // export const createCourse = asyncHandler(async (req, res, next) => {
// //   const { title, description, category, createdBy } = req.body;

// //   if (!title || !description || !category || !createdBy) {
// //     return next(new AppError('All fields are required', 400));
// //   }

// //   const course = await Course.create({
// //     title,
// //     description,
// //     category,
// //     createdBy,
// //   });

// //   if (!course) {
// //     return next(
// //       new AppError('Course could not be created, please try again', 400)
// //     );
// //   }

// //   // Run only if user sends a file (thumbnail)
// //   if (req.file) {
// //     try {
// //       const result = await cloudinary.v2.uploader.upload(req.file.path, {
// //         folder: 'lms', // Save files in a folder named lms
// //       });

// //       // If success
// //       if (result) {
// //         // Set the public_id and secure_url in array
// //         course.thumbnail.public_id = result.public_id;
// //         course.thumbnail.secure_url = result.secure_url;
// //       }

// //       // After successful upload remove the file from local storage
// //       await fs.rm(`uploads/${req.file.filename}`);
// //     } catch (error) {
// //       // Empty the uploads directory without deleting the uploads directory
// //       for (const file of await fs.readdir('uploads/')) {
// //         await fs.unlink(path.join('uploads/', file));
// //       }

// //       // Send the error message
// //       return next(
// //         new AppError(
// //           JSON.stringify(error) || 'File not uploaded, please try again',
// //           400
// //         )
// //       );
// //     }
// //   }

// //   // Save the changes
// //   await course.save();

// //   res.status(201).json({
// //     success: true,
// //     message: 'Course created successfully',
// //     course,
// //   });
// // });

// // /**
// //  * @GET_LECTURES_BY_COURSE_ID
// //  * @ROUTE @POST {{URL}}/api/v1/courses/:id
// //  * @ACCESS Private(ADMIN, subscribed users only)
// //  *
// //  * NOTE: This endpoint previously returned `course.lectures`. Now lectures include
// //  * homeworks and notes so frontend can show Video / Homework / Notes buttons and content.
// //  */
// // export const getLecturesByCourseId = asyncHandler(async (req, res, next) => {
// //   const { id } = req.params;

// //   const course = await Course.findById(id);

// //   if (!course) {
// //     return next(new AppError('Invalid course id or course not found.', 404));
// //   }

// //   res.status(200).json({
// //     success: true,
// //     message: 'Course lectures fetched successfully',
// //     lectures: course.lectures, // now contains homeworks & notes
// //   });
// // });

// // /**
// //  * @ADD_LECTURE
// //  * @ROUTE @POST {{URL}}/api/v1/courses/:id
// //  * @ACCESS Private (Admin Only)
// //  *
// //  * Updated to initialize homeworks and notes in lecture object so each lecture acts like a chapter.
// //  */
// // export const addLectureToCourseById = asyncHandler(async (req, res, next) => {
// //   const { title, description } = req.body;
// //   const { id } = req.params;

// //   let lectureData = {};

// //   if (!title || !description) {
// //     return next(new AppError('Title and Description are required', 400));
// //   }

// //   const course = await Course.findById(id);

// //   if (!course) {
// //     return next(new AppError('Invalid course id or course not found.', 400));
// //   }

// //   // Run only if user sends a file (video)
// //   if (req.file) {
// //     try {
// //       const result = await cloudinary.v2.uploader.upload(req.file.path, {
// //         folder: 'lms', // Save files in a folder named lms
// //         chunk_size: 50000000, // 50 mb
// //         resource_type: 'video',
// //       });

// //       // If success
// //       if (result) {
// //         // Set the public_id and secure_url in lectureData
// //         lectureData.public_id = result.public_id;
// //         lectureData.secure_url = result.secure_url;
// //       }

// //       // After successful upload remove the file from local storage
// //       await fs.rm(`uploads/${req.file.filename}`);
// //     } catch (error) {
// //       // Empty the uploads directory without deleting the uploads directory
// //       for (const file of await fs.readdir('uploads/')) {
// //         await fs.unlink(path.join('uploads/', file));
// //       }

// //       // Send the error message
// //       return next(
// //         new AppError(
// //           JSON.stringify(error) || 'File not uploaded, please try again',
// //           400
// //         )
// //       );
// //     }
// //   } else {
// //     return next(new AppError('Video file (req.file) is required', 400));
// //   }

// //   // Push lecture — initialize homeworks and notes for this lecture (chapter)
// //   course.lectures.push({
// //     title,
// //     description,
// //     lecture: {
// //       public_id: lectureData.public_id,
// //       secure_url: lectureData.secure_url,
// //     },
// //     homeworks: [], // <-- new
// //     notes: '',     // <-- new
// //   });

// //   course.numberOfLectures = course.lectures.length;

// //   // Save the course object
// //   await course.save();

// //   res.status(200).json({
// //     success: true,
// //     message: 'Course lecture added successfully',
// //     course,
// //   });
// // });

// // /**
// //  * @ADD_HOMEWORK_TO_LECTURE
// //  * @ROUTE @POST {{URL}}/api/v1/courses/:courseId/lectures/:lectureId/homeworks
// //  * @ACCESS Private (Admin only)
// //  *
// //  * Body: { title, description, questions: [{ text, solution, attachments, order }], dueDate, points }
// //  */
// // export const addHomeworkToLecture = asyncHandler(async (req, res, next) => {
// //   const { courseId, lectureId } = req.params;
// //   const { title, description, questions = [], dueDate, points, order } = req.body;

// //   if (!title) return next(new AppError('Homework title is required', 400));

// //   const course = await Course.findById(courseId);
// //   if (!course) return next(new AppError('Course not found', 404));

// //   const lecture = course.lectures.find((l) => l._id.toString() === lectureId.toString());
// //   if (!lecture) return next(new AppError('Lecture not found', 404));

// //   lecture.homeworks.push({
// //     title,
// //     description,
// //     questions,
// //     dueDate,
// //     points,
// //     order,
// //   });

// //   await course.save();

// //   res.status(201).json({
// //     success: true,
// //     message: 'Homework added to lecture',
// //     homework: lecture.homeworks.slice(-1)[0],
// //   });
// // });

// // /**
// //  * @REMOVE_HOMEWORK_FROM_LECTURE
// //  * @ROUTE @DELETE {{URL}}/api/v1/courses/:courseId/lectures/:lectureId/homeworks/:hwId
// //  * @ACCESS Private (Admin only)
// //  */
// // export const removeHomeworkFromLecture = asyncHandler(async (req, res, next) => {
// //   const { courseId, lectureId, hwId } = req.params;

// //   const course = await Course.findById(courseId);
// //   if (!course) return next(new AppError('Course not found', 404));

// //   const lecture = course.lectures.find((l) => l._id.toString() === lectureId.toString());
// //   if (!lecture) return next(new AppError('Lecture not found', 404));

// //   const hwIndex = lecture.homeworks.findIndex((h) => h._id.toString() === hwId.toString());
// //   if (hwIndex === -1) return next(new AppError('Homework not found', 404));

// //   lecture.homeworks.splice(hwIndex, 1);
// //   await course.save();

// //   res.status(200).json({
// //     success: true,
// //     message: 'Homework removed from lecture',
// //   });
// // });

// // /**
// //  * @GET_QUESTION_SOLUTION
// //  * @ROUTE @GET {{URL}}/api/v1/courses/:courseId/lectures/:lectureId/homeworks/:hwId/questions/:questionId/solution
// //  * @ACCESS Private (subscribed users)
// //  *
// //  * Useful for lazy-loading solutions — frontend toggles show/hide and can call this endpoint when user clicks "Show Solution".
// //  */
// // export const getQuestionSolution = asyncHandler(async (req, res, next) => {
// //   const { courseId, lectureId, hwId, questionId } = req.params;

// //   const course = await Course.findById(courseId).lean();
// //   if (!course) return next(new AppError('Course not found', 404));

// //   const lecture = (course.lectures || []).find((l) => l._id.toString() === lectureId.toString());
// //   if (!lecture) return next(new AppError('Lecture not found', 404));

// //   const homework = (lecture.homeworks || []).find((h) => h._id.toString() === hwId.toString());
// //   if (!homework) return next(new AppError('Homework not found', 404));

// //   const question = (homework.questions || []).find((q) => q._id.toString() === questionId.toString());
// //   if (!question) return next(new AppError('Question not found', 404));

// //   res.status(200).json({
// //     success: true,
// //     solution: question.solution || '',
// //   });
// // });

// // /**
// //  * @UPDATE_LECTURE_NOTES
// //  * @ROUTE @PUT {{URL}}/api/v1/courses/:courseId/lectures/:lectureId/notes
// //  * @ACCESS Private (Admin only)
// //  *
// //  * Body: { notes } // markdown or HTML
// //  */
// // export const updateLectureNotes = asyncHandler(async (req, res, next) => {
// //   const { courseId, lectureId } = req.params;
// //   const { notes } = req.body;

// //   if (typeof notes !== 'string') return next(new AppError('Notes must be a string (markdown/HTML).', 400));

// //   const course = await Course.findById(courseId);
// //   if (!course) return next(new AppError('Course not found', 404));

// //   const lecture = course.lectures.find((l) => l._id.toString() === lectureId.toString());
// //   if (!lecture) return next(new AppError('Lecture not found', 404));

// //   lecture.notes = notes;

// //   await course.save();

// //   res.status(200).json({
// //     success: true,
// //     message: 'Lecture notes updated',
// //     notes: lecture.notes,
// //   });
// // });

// // /**
// //  * @Remove_LECTURE (existing)
// //  * @ROUTE @DELETE {{URL}}/api/v1/courses/:courseId/lectures/:lectureId
// //  * @ACCESS Private (Admin only)
// //  *
// //  * Keep this as-is (your existing method). If you want, I can update the route signature to use params instead of query.
// //  */
// // export const removeLectureFromCourse = asyncHandler(async (req, res, next) => {
// //   // Grabbing the courseId and lectureId from req.query (kept same as your original)
// //   const { courseId, lectureId } = req.query;

// //   // Checking if both courseId and lectureId are present
// //   if (!courseId) {
// //     return next(new AppError('Course ID is required', 400));
// //   }

// //   if (!lectureId) {
// //     return next(new AppError('Lecture ID is required', 400));
// //   }

// //   // Find the course using the courseId
// //   const course = await Course.findById(courseId);

// //   // If no course send custom message
// //   if (!course) {
// //     return next(new AppError('Invalid ID or Course does not exist.', 404));
// //   }

// //   // Find the index of the lecture using the lectureId
// //   const lectureIndex = course.lectures.findIndex(
// //     (lecture) => lecture._id.toString() === lectureId.toString()
// //   );

// //   // If returned index is -1 then send error as mentioned below
// //   if (lectureIndex === -1) {
// //     return next(new AppError('Lecture does not exist.', 404));
// //   }

// //   // Delete the lecture from cloudinary
// //   await cloudinary.v2.uploader.destroy(
// //     course.lectures[lectureIndex].lecture.public_id,
// //     {
// //       resource_type: 'video',
// //     }
// //   );

// //   // Remove the lecture from the array
// //   course.lectures.splice(lectureIndex, 1);

// //   // update the number of lectures based on lectures array length
// //   course.numberOfLectures = course.lectures.length;

// //   // Save the course object
// //   await course.save();

// //   // Return response
// //   res.status(200).json({
// //     success: true,
// //     message: 'Course lecture removed successfully',
// //   });
// // });

// // /**
// //  * @UPDATE_COURSE_BY_ID
// //  * @ROUTE @PUT {{URL}}/api/v1/courses/:id
// //  * @ACCESS Private (Admin only)
// //  */
// // export const updateCourseById = asyncHandler(async (req, res, next) => {
// //   // Extracting the course id from the request params
// //   const { id } = req.params;

// //   // Finding the course using the course id
// //   const course = await Course.findByIdAndUpdate(
// //     id,
// //     {
// //       $set: req.body, // This will only update the fields which are present
// //     },
// //     {
// //       runValidators: true, // This will run the validation checks on the new data
// //     }
// //   );

// //   // If no course found then send the response for the same
// //   if (!course) {
// //     return next(new AppError('Invalid course id or course not found.', 400));
// //   }

// //   // Sending the response after success
// //   res.status(200).json({
// //     success: true,
// //     message: 'Course updated successfully',
// //   });
// // });

// // /**
// //  * @DELETE_COURSE_BY_ID
// //  * @ROUTE @DELETE {{URL}}/api/v1/courses/:id
// //  * @ACCESS Private (Admin only)
// //  */
// // export const deleteCourseById = asyncHandler(async (req, res, next) => {
// //   // Extracting id from the request parameters
// //   const { id } = req.params;

// //   // Finding the course via the course ID
// //   const course = await Course.findById(id);

// //   // If course not find send the message as stated below
// //   if (!course) {
// //     return next(new AppError('Course with given id does not exist.', 404));
// //   }

// //   // Remove course
// //   await course.remove();

// //   // Send the message as response
// //   res.status(200).json({
// //     success: true,
// //     message: 'Course deleted successfully',
// //   });
// // });

// import fs from 'fs/promises';
// import path from 'path';

// import cloudinary from 'cloudinary';

// import asyncHandler from '../middlewares/asyncHandler.middleware.js';
// import Course from '../models/course.model.js';
// import AppError from '../utils/AppError.js';

// /**
//  * @ALL_COURSES
//  * @ROUTE @GET {{URL}}/api/v1/courses
//  * @ACCESS Public
//  */
// export const getAllCourses = asyncHandler(async (_req, res, next) => {
//   // Find all the courses without lectures (keep it light)
//   const courses = await Course.find({}).select('-lectures');

//   res.status(200).json({
//     success: true,
//     message: 'All courses',
//     courses,
//   });
// });

// /**
//  * @CREATE_COURSE
//  * @ROUTE @POST {{URL}}/api/v1/courses
//  * @ACCESS Private (admin only)
//  */
// export const createCourse = asyncHandler(async (req, res, next) => {
//   const { title, description, category, createdBy } = req.body;

//   if (!title || !description || !category || !createdBy) {
//     return next(new AppError('All fields are required', 400));
//   }

//   const course = await Course.create({
//     title,
//     description,
//     category,
//     createdBy,
//   });

//   if (!course) {
//     return next(
//       new AppError('Course could not be created, please try again', 400)
//     );
//   }

//   // Run only if user sends a file (thumbnail)
//   if (req.file) {
//     try {
//       const result = await cloudinary.v2.uploader.upload(req.file.path, {
//         folder: 'lms', // Save files in a folder named lms
//       });

//       // If success
//       if (result) {
//         // Set the public_id and secure_url in array
//         course.thumbnail.public_id = result.public_id;
//         course.thumbnail.secure_url = result.secure_url;
//       }

//       // After successful upload remove the file from local storage
//       await fs.rm(`uploads/${req.file.filename}`);
//     } catch (error) {
//       // Empty the uploads directory without deleting the uploads directory
//       for (const file of await fs.readdir('uploads/')) {
//         await fs.unlink(path.join('uploads/', file));
//       }

//       // Send the error message
//       return next(
//         new AppError(
//           JSON.stringify(error) || 'File not uploaded, please try again',
//           400
//         )
//       );
//     }
//   }

//   // Save the changes
//   await course.save();

//   res.status(201).json({
//     success: true,
//     message: 'Course created successfully',
//     course,
//   });
// });

// /**
//  * @GET_LECTURES_BY_COURSE_ID
//  * @ROUTE @POST {{URL}}/api/v1/courses/:id
//  * @ACCESS Private(ADMIN, subscribed users only)
//  *
//  * NOTE: This endpoint previously returned `course.lectures`. Now lectures include
//  * homeworks and notes so frontend can show Video / Homework / Notes buttons and content.
//  */
// export const getLecturesByCourseId = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const course = await Course.findById(id);

//   if (!course) {
//     return next(new AppError('Invalid course id or course not found.', 404));
//   }

//   res.status(200).json({
//     success: true,
//     message: 'Course lectures fetched successfully',
//     lectures: course.lectures, // now contains homeworks & notes
//   });
// });

// /**
//  * @ADD_LECTURE
//  * @ROUTE @POST {{URL}}/api/v1/courses/:id
//  * @ACCESS Private (Admin Only)
//  *
//  * Updated to initialize homeworks and notes in lecture object so each lecture acts like a chapter.
//  */
// export const addLectureToCourseById = asyncHandler(async (req, res, next) => {
//   const { title, description } = req.body;
//   const { id } = req.params;

//   let lectureData = {};

//   if (!title || !description) {
//     return next(new AppError('Title and Description are required', 400));
//   }

//   const course = await Course.findById(id);

//   if (!course) {
//     return next(new AppError('Invalid course id or course not found.', 400));
//   }

//   // Run only if user sends a file (video)
//   if (req.file) {
//     try {
//       const result = await cloudinary.v2.uploader.upload(req.file.path, {
//         folder: 'lms', // Save files in a folder named lms
//         chunk_size: 50000000, // 50 mb
//         resource_type: 'video',
//       });

//       // If success
//       if (result) {
//         // Set the public_id and secure_url in lectureData
//         lectureData.public_id = result.public_id;
//         lectureData.secure_url = result.secure_url;
//       }

//       // After successful upload remove the file from local storage
//       await fs.rm(`uploads/${req.file.filename}`);
//     } catch (error) {
//       // Empty the uploads directory without deleting the uploads directory
//       for (const file of await fs.readdir('uploads/')) {
//         await fs.unlink(path.join('uploads/', file));
//       }

//       // Send the error message
//       return next(
//         new AppError(
//           JSON.stringify(error) || 'File not uploaded, please try again',
//           400
//         )
//       );
//     }
//   } else {
//     return next(new AppError('Video file (req.file) is required', 400));
//   }

//   // Push lecture — initialize homeworks and notes for this lecture (chapter)
//   course.lectures.push({
//     title,
//     description,
//     lecture: {
//       public_id: lectureData.public_id,
//       secure_url: lectureData.secure_url,
//     },
//     homeworks: [], // <-- new
//     notes: '',     // <-- new
//   });

//   course.numberOfLectures = course.lectures.length;

//   // Save the course object
//   await course.save();

//   res.status(200).json({
//     success: true,
//     message: 'Course lecture added successfully',
//     course,
//   });
// });

// /**
//  * @ADD_HOMEWORK_TO_LECTURE
//  * @ROUTE @POST {{URL}}/api/v1/courses/:courseId/lectures/:lectureId/homeworks
//  * @ACCESS Private (Admin only)
//  *
//  * Body: { title, description, questions: [{ text, solution, attachments, order }], dueDate, points }
//  */
// export const addHomeworkToLecture = asyncHandler(async (req, res, next) => {
//   const { courseId, lectureId } = req.params;
//   const { title, description, questions = [], dueDate, points, order } = req.body;

//   if (!title) return next(new AppError('Homework title is required', 400));

//   const course = await Course.findById(courseId);
//   if (!course) return next(new AppError('Course not found', 404));

//   const lecture = course.lectures.find((l) => l._id.toString() === lectureId.toString());
//   if (!lecture) return next(new AppError('Lecture not found', 404));

//   lecture.homeworks.push({
//     title,
//     description,
//     questions,
//     dueDate,
//     points,
//     order,
//   });

//   await course.save();

//   res.status(201).json({
//     success: true,
//     message: 'Homework added to lecture',
//     homework: lecture.homeworks.slice(-1)[0],
//   });
// });

// /**
//  * @REMOVE_HOMEWORK_FROM_LECTURE
//  * @ROUTE @DELETE {{URL}}/api/v1/courses/:courseId/lectures/:lectureId/homeworks/:hwId
//  * @ACCESS Private (Admin only)
//  */
// export const removeHomeworkFromLecture = asyncHandler(async (req, res, next) => {
//   const { courseId, lectureId, hwId } = req.params;

//   const course = await Course.findById(courseId);
//   if (!course) return next(new AppError('Course not found', 404));

//   const lecture = course.lectures.find((l) => l._id.toString() === lectureId.toString());
//   if (!lecture) return next(new AppError('Lecture not found', 404));

//   const hwIndex = lecture.homeworks.findIndex((h) => h._id.toString() === hwId.toString());
//   if (hwIndex === -1) return next(new AppError('Homework not found', 404));

//   lecture.homeworks.splice(hwIndex, 1);
//   await course.save();

//   res.status(200).json({
//     success: true,
//     message: 'Homework removed from lecture',
//   });
// });

// /**
//  * @GET_QUESTION_SOLUTION
//  * @ROUTE @GET {{URL}}/api/v1/courses/:courseId/lectures/:lectureId/homeworks/:hwId/questions/:questionId/solution
//  * @ACCESS Private (subscribed users)
//  *
//  * Useful for lazy-loading solutions — frontend toggles show/hide and can call this endpoint when user clicks "Show Solution".
//  */
// export const getQuestionSolution = asyncHandler(async (req, res, next) => {
//   const { courseId, lectureId, hwId, questionId } = req.params;

//   const course = await Course.findById(courseId).lean();
//   if (!course) return next(new AppError('Course not found', 404));

//   const lecture = (course.lectures || []).find((l) => l._id.toString() === lectureId.toString());
//   if (!lecture) return next(new AppError('Lecture not found', 404));

//   const homework = (lecture.homeworks || []).find((h) => h._id.toString() === hwId.toString());
//   if (!homework) return next(new AppError('Homework not found', 404));

//   const question = (homework.questions || []).find((q) => q._id.toString() === questionId.toString());
//   if (!question) return next(new AppError('Question not found', 404));

//   res.status(200).json({
//     success: true,
//     solution: question.solution || '',
//   });
// });

// /**
//  * @UPDATE_LECTURE_NOTES
//  * @ROUTE @PUT {{URL}}/api/v1/courses/:courseId/lectures/:lectureId/notes
//  * @ACCESS Private (Admin only)
//  *
//  * Body: { notes } // markdown or HTML
//  */
// export const updateLectureNotes = asyncHandler(async (req, res, next) => {
//   const { courseId, lectureId } = req.params;
//   const { notes } = req.body;

//   if (typeof notes !== 'string') return next(new AppError('Notes must be a string (markdown/HTML).', 400));

//   const course = await Course.findById(courseId);
//   if (!course) return next(new AppError('Course not found', 404));

//   const lecture = course.lectures.find((l) => l._id.toString() === lectureId.toString());
//   if (!lecture) return next(new AppError('Lecture not found', 404));

//   lecture.notes = notes;

//   await course.save();

//   res.status(200).json({
//     success: true,
//     message: 'Lecture notes updated',
//     notes: lecture.notes,
//   });
// });

// /**
//  * @Remove_LECTURE (existing)
//  * @ROUTE @DELETE {{URL}}/api/v1/courses/:courseId/lectures/:lectureId
//  * @ACCESS Private (Admin only)
//  *
//  * Keep this as-is (your existing method). If you want, I can update the route signature to use params instead of query.
//  */
// export const removeLectureFromCourse = asyncHandler(async (req, res, next) => {
//   // Grabbing the courseId and lectureId from req.query (kept same as your original)
//   const { courseId, lectureId } = req.query;

//   // Checking if both courseId and lectureId are present
//   if (!courseId) {
//     return next(new AppError('Course ID is required', 400));
//   }

//   if (!lectureId) {
//     return next(new AppError('Lecture ID is required', 400));
//   }

//   // Find the course using the courseId
//   const course = await Course.findById(courseId);

//   // If no course send custom message
//   if (!course) {
//     return next(new AppError('Invalid ID or Course does not exist.', 404));
//   }

//   // Find the index of the lecture using the lectureId
//   const lectureIndex = course.lectures.findIndex(
//     (lecture) => lecture._id.toString() === lectureId.toString()
//   );

//   // If returned index is -1 then send error as mentioned below
//   if (lectureIndex === -1) {
//     return next(new AppError('Lecture does not exist.', 404));
//   }

//   // Delete the lecture from cloudinary
//   await cloudinary.v2.uploader.destroy(
//     course.lectures[lectureIndex].lecture.public_id,
//     {
//       resource_type: 'video',
//     }
//   );

//   // Remove the lecture from the array
//   course.lectures.splice(lectureIndex, 1);

//   // update the number of lectures based on lectures array length
//   course.numberOfLectures = course.lectures.length;

//   // Save the course object
//   await course.save();

//   // Return response
//   res.status(200).json({
//     success: true,
//     message: 'Course lecture removed successfully',
//   });
// });

// /**
//  * @UPDATE_COURSE_BY_ID
//  * @ROUTE @PUT {{URL}}/api/v1/courses/:id
//  * @ACCESS Private (Admin only)
//  */
// export const updateCourseById = asyncHandler(async (req, res, next) => {
//   // Extracting the course id from the request params
//   const { id } = req.params;

//   // Finding the course using the course id
//   const course = await Course.findByIdAndUpdate(
//     id,
//     {
//       $set: req.body, // This will only update the fields which are present
//     },
//     {
//       runValidators: true, // This will run the validation checks on the new data
//     }
//   );

//   // If no course found then send the response for the same
//   if (!course) {
//     return next(new AppError('Invalid course id or course not found.', 400));
//   }

//   // Sending the response after success
//   res.status(200).json({
//     success: true,
//     message: 'Course updated successfully',
//   });
// });

// /**
//  * @DELETE_COURSE_BY_ID
//  * @ROUTE @DELETE {{URL}}/api/v1/courses/:id
//  * @ACCESS Private (Admin only)
//  */
// export const deleteCourseById = asyncHandler(async (req, res, next) => {
//   // Extracting id from the request parameters
//   const { id } = req.params;

//   // Finding the course via the course ID
//   const course = await Course.findById(id);

//   // If course not find send the message as stated below
//   if (!course) {
//     return next(new AppError('Course with given id does not exist.', 404));
//   }

//   // Remove course
//   await course.remove();

//   // Send the message as response
//   res.status(200).json({
//     success: true,
//     message: 'Course deleted successfully',
//   });
// });
import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import Course from '../models/course.model.js';
import AppError from '../utils/appError.js';

/**
 * @ALL_COURSES
 * @ROUTE @GET {{URL}}/api/v1/courses
 * @ACCESS Public
 */
export const getAllCourses = asyncHandler(async (req, res, _next) => {
  // Find all the courses without lectures
  const courses = await Course.find({}).select('-lectures');

  res.status(200).json({
    success: true,
    message: 'All courses',
    courses,
  });
});

/**
 * @CREATE_COURSE
 * @ROUTE @POST {{URL}}/api/v1/courses
 * @ACCESS Private (ADMIN Only)
 */
export const createCourse = asyncHandler(async (req, res, next) => {
  // Destructuring the necessary data from req object
  const { title, description, category, createdBy, price } = req.body;

  // Defensive logging for debugging connection reset / upload failures
  // (will print request body summary and file metadata)
  try {
    // eslint-disable-next-line no-console
    console.log('createCourse called', {
      body: { title, description, category, createdBy, price },
      file: req.file
        ? { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size }
        : null,
    });
  } catch (logErr) {
    // ignore logging errors
  }

  if (!title || !description || !category || !createdBy) {
    return next(new AppError('All fields are required', 400));
  }

  // If price is not provided or is negative, set it to 0
  const coursePrice = parseFloat(price) >= 0 ? parseFloat(price) : 0;

  // Create new course
  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    price: coursePrice, // ADDED price field
    thumbnail: {
      public_id: 'DUMMY',
      secure_url: 'DUMMY',
    },
  });

  // Check if course created successfully
  if (!course) {
    return next(new AppError('Course could not be created, please try again', 400));
  }

  // Run only if user sends a file
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'lms', // Save files in a folder named lms
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill',
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in DB
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }

      // After successful upload remove the file from local storage
      await fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      // Log the original error for debugging
      try {
        // eslint-disable-next-line no-console
        console.error(
          'cloudinary upload error (createCourse):',
          error && (error.stack || error.message || error)
        );
      } catch (e) {}
      // Empty the uploads directory without affecting the server
      try {
        await fs.rm(`uploads/${req.file.filename}`);
      } catch (e) {
        // ignore cleanup error
      }
      return next(new AppError(error.message || 'File not uploaded, please try again', 400));
    }
  }

  // Save the user object
  await course.save();

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    course,
  });
});

/**
 * @UPDATE_COURSE_BY_ID
 * @ROUTE @PUT {{URL}}/api/v1/courses/:id
 * @ACCESS Private (Admin only)
 */
export const updateCourseById = asyncHandler(async (req, res, next) => {
  // Extracting the course id from req.params
  const { id } = req.params;

  // Finding the course using the id
  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError('Course with given id does not exist', 404));
  }

  // ADDED price to the update
  const { title, description, category, createdBy, price } = req.body;

  // Update the course fields
  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (createdBy) course.createdBy = createdBy;
  // If price is provided and is a valid number, update it
  if (price !== undefined && !isNaN(parseFloat(price)) && parseFloat(price) >= 0) {
    course.price = parseFloat(price);
  }

  // Run only if user sends a file
  if (req.file) {
    // Deletes the old image uploaded by the user
    if (course.thumbnail.public_id) {
      await cloudinary.uploader.destroy(course.thumbnail.public_id);
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'lms',
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill',
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in DB
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;

        // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      fs.rm(`uploads/${req.file.filename}`);
      return next(new AppError(error || 'File not uploaded, please try again', 400));
    }
  }

  // Save the changes
  await course.save();

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    course,
  });
});

/**
 * @GET_LECTURES_BY_COURSE_ID
 * @ROUTE @GET {{URL}}/api/v1/courses/:id
 * @ACCESS Private(ADMIN, subscribed users)
 */
export const getLecturesByCourseId = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError('Invalid course id or course not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Course lectures fetched successfully',
    lectures: course.lectures,
  });
});

/**
 * @ADD_LECTURE
 * @ROUTE @POST {{URL}}/api/v1/courses/:id
 * @ACCESS Private (ADMIN only)
 */
export const addLectureToCourseById = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const { id } = req.params;

  let lectureData = {
    title,
    description,
    lecture: {},
  };

  if (!title || !description) {
    return next(new AppError('Title and Description are required', 400));
  }

  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError('Invalid course id or course not found.', 404));
  }

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'lms',
        chunk_size: 50000000, // 50 mb
        resource_type: 'video',
      });

      if (result) {
        lectureData.lecture.public_id = result.public_id;
        lectureData.lecture.secure_url = result.secure_url;
      }

      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      fs.rm(`uploads/${req.file.filename}`);
      return next(new AppError(error.message || 'File not uploaded, please try again', 400));
    }
  }

  course.lectures.push(lectureData);
  course.numberOfLectures = course.lectures.length;

  await course.save();

  res.status(200).json({
    success: true,
    message: 'Course lecture added successfully',
    course,
  });
});

/**
 * @DELETE_COURSE_BY_ID
 * @ROUTE @DELETE {{URL}}/api/v1/courses/:id
 * @ACCESS Private (Admin only)
 */
export const deleteCourseById = asyncHandler(async (req, res, next) => {
  // Extracting id from query params
  const { id } = req.params;

  // Finding the course via id
  const course = await Course.findById(id);

  // If no course send error response
  if (!course) {
    return next(new AppError('Course with given id does not exist', 404));
  }

  // Remove thumbnail from cloudinary
  if (course.thumbnail.public_id) {
    await cloudinary.uploader.destroy(course.thumbnail.public_id);
  }

  // Remove lectures from cloudinary
  for (const lecture of course.lectures) {
    if (lecture.lecture.public_id) {
      await cloudinary.uploader.destroy(lecture.lecture.public_id, {
        resource_type: 'video',
      });
    }
  }

  // Delete the course
  await Course.findByIdAndDelete(id);

  // Send the response
  res.status(200).json({
    success: true,
    message: 'Course deleted successfully',
  });
});

/**
 * @DELETE_LECTURE
 * @ROUTE @DELETE {{URL}}/api/v1/courses?courseId=...&lectureId=...
 * @ACCESS Private (ADMIN only)
 */
export const removeLectureFromCourse = asyncHandler(async (req, res, next) => {
  // Grabbing IDs from query
  const { courseId, lectureId } = req.query;

  // Checking if the IDs are there or not
  if (!courseId) {
    return next(new AppError('Course ID is required', 400));
  }

  if (!lectureId) {
    return next(new AppError('Lecture ID is required', 400));
  }

  // Find the course
  const course = await Course.findById(courseId);

  // If no course send error response
  if (!course) {
    return next(new AppError('Course with given id does not exist', 404));
  }

  // Find the index of the lecture
  const lectureIndex = course.lectures.findIndex((lecture) => lecture._id.toString() === lectureId);

  // If no lecture send error response
  if (lectureIndex === -1) {
    return next(new AppError('Lecture does not exist.', 404));
  }

  // Delete the lecture from cloudinary
  const lecture = course.lectures[lectureIndex];
  if (lecture.lecture.public_id) {
    await cloudinary.uploader.destroy(lecture.lecture.public_id, {
      resource_type: 'video',
    });
  }

  // Remove the lecture from the lectures array
  course.lectures.splice(lectureIndex, 1);

  // Update the number of lectures
  course.numberOfLectures = course.lectures.length;

  // Save the course
  await course.save();

  // Send the response
  res.status(200).json({
    success: true,
    message: 'Course lecture removed successfully',
  });
});

// NEW homework/notes controllers (from original file)
export const addHomeworkToLecture = asyncHandler(async (req, res, next) => {
  const { courseId, lectureId } = req.params;
  const { title, description, questions, dueDate, points } = req.body;

  if (!title || !description) {
    return next(new AppError('Homework title and description are required', 400));
  }
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  const lecture = course.lectures.id(lectureId);
  if (!lecture) {
    return next(new AppError('Lecture not found', 404));
  }
  lecture.homeworks.push({
    title,
    description,
    questions: questions || [],
    dueDate,
    points: points || 0,
    order: lecture.homeworks.length,
  });
  await course.save();
  res.status(201).json({
    success: true,
    message: 'Homework added successfully',
    course,
  });
});

export const removeHomeworkFromLecture = asyncHandler(async (req, res, next) => {
  const { courseId, lectureId, hwId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  const lecture = course.lectures.id(lectureId);
  if (!lecture) {
    return next(new AppError('Lecture not found', 404));
  }
  const hwIndex = lecture.homeworks.findIndex((hw) => hw._id.toString() === hwId);
  if (hwIndex === -1) {
    return next(new AppError('Homework not found', 404));
  }
  lecture.homeworks.splice(hwIndex, 1);
  await course.save();
  res.status(200).json({
    success: true,
    message: 'Homework removed successfully',
    course,
  });
});

export const getQuestionSolution = asyncHandler(async (req, res, next) => {
  const { courseId, lectureId, hwId, questionId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  const lecture = course.lectures.id(lectureId);
  if (!lecture) {
    return next(new AppError('Lecture not found', 404));
  }
  const homework = lecture.homeworks.id(hwId);
  if (!homework) {
    return next(new AppError('Homework not found', 404));
  }
  const question = homework.questions.id(questionId);
  if (!question) {
    return next(new AppError('Question not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'Solution retrieved',
    solution: question.solution,
  });
});

export const updateLectureNotes = asyncHandler(async (req, res, next) => {
  const { courseId, lectureId } = req.params;
  const { notes } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  const lecture = course.lectures.id(lectureId);
  if (!lecture) {
    return next(new AppError('Lecture not found', 404));
  }
  lecture.notes = notes || '';
  await course.save();
  res.status(200).json({
    success: true,
    message: 'Notes updated successfully',
    lecture,
  });
});

/**
 * @REMOVE_QUESTION_FROM_HOMEWORK
 * @ROUTE @DELETE {{URL}}/api/v1/courses/:courseId/lectures/:lectureId/homeworks/:hwId/questions/:questionId
 * @ACCESS Private (Admin only)
 */
export const removeQuestionFromHomework = asyncHandler(async (req, res, next) => {
  const { courseId, lectureId, hwId, questionId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const lecture = course.lectures.id(lectureId);
  if (!lecture) {
    return next(new AppError('Lecture not found', 404));
  }

  const homework = lecture.homeworks.id(hwId);
  if (!homework) {
    return next(new AppError('Homework not found', 404));
  }

  const question = homework.questions.id(questionId);
  if (!question) {
    return next(new AppError('Question not found', 404));
  }

  // Use Mongoose .pull() to remove the subdocument
  homework.questions.pull(questionId);

  await course.save();

  res.status(200).json({
    success: true,
    message: 'Question removed from homework successfully',
    course, // or just 'homework'
  });
});
