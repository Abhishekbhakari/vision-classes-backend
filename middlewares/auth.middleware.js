// import jwt from "jsonwebtoken";

// import AppError from "../utils/AppError.js";
// import asyncHandler from "./asyncHandler.middleware.js";

// export const isLoggedIn = asyncHandler(async (req, _res, next) => {
//   // extracting token from the cookies
//   const { token } = req.cookies;

//   // If no token send unauthorized message
//   if (!token) {
//     return next(new AppError("Unauthorized, please login to continue", 401));
//   }

//   // Decoding the token using jwt package verify method
//   const decoded = await jwt.verify(token, process.env.JWT_SECRET);

//   // If no decode send the message unauthorized
//   if (!decoded) {
//     return next(new AppError("Unauthorized, please login to continue", 401));
//   }

//   // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
//   req.user = decoded;

//   // Do not forget to call the next other wise the flow of execution will not be passed further
//   next();
// });

// // Middleware to check if user is admin or not
// export const authorizeRoles = (...roles) =>
//   asyncHandler(async (req, _res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError("You do not have permission to view this route", 403)
//       );
//     }

//     next();
//   });

// // Middleware to check if user has an active subscription or not
// export const authorizeSubscribers = asyncHandler(async (req, _res, next) => {
//   // If user is not admin or does not have an active subscription then error else pass
//   if (req.user.role !== "ADMIN" && req.user.subscription.status !== "active") {
//     return next(new AppError("Please subscribe to access this route.", 403));
//   }

//   next();
// });
import jwt from 'jsonwebtoken';

import AppError from '../utils/AppError.js';
import asyncHandler from './asyncHandler.middleware.js';
import User from '../models/user.model.js'; // Import User

export const isLoggedIn = asyncHandler(async (req, _res, next) => {
  // extracting token from the cookies
  const { token } = req.cookies;

  // If no token send unauthorized message
  if (!token) {
    return next(new AppError('Unauthorized, please login to continue', 401));
  }

  // Decoding the token using jwt package verify method
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // If no decode send the message unauthorized
  if (!decoded) {
    return next(new AppError('Unauthorized, please login to continue', 401));
  }

  // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
  req.user = decoded;

  // Do not forget to call the next other wise the flow of execution will not be passed further
  next();
});

// Middleware to check if user is admin or not
export const authorizeRoles =
  (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to view this route', 403)
      );
    }

    next();
  });

// Middleware to check if user has purchased the course or not
export const authorizeSubscribers = asyncHandler(async (req, _res, next) => {
  const courseId = req.params.id || req.params.courseId;

  if (!courseId) {
    return next(new AppError('Course ID not found in request', 400));
  }

  // If user is not admin and has not purchased the course
  if (
    req.user.role !== 'ADMIN' &&
    !req.user.purchasedCourses.includes(courseId)
  ) {
    return next(
      new AppError('Please purchase this course to access it.', 403)
    );
  }

  next();
});
