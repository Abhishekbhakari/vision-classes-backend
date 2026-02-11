import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import * as courseService from './course.service';
import AppError from '../../utils/AppError';

export const getAllCourses = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { category } = req.query;
    const courses = await courseService.getAll(category as string);

    res.status(200).json({
        success: true,
        message: 'All courses',
        courses,
    });
});

export const createCourse = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const course = await courseService.create(req.body, req.file);

    res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course,
    });
});

export const getLecturesByCourseId = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const lectures = await courseService.getLectures(id);

    res.status(200).json({
        success: true,
        message: 'Course lectures fetched successfully',
        lectures,
    });
});

export const addLectureToCourseById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!req.file) return next(new AppError('Video file is required', 400));

    const course = await courseService.addLecture(id, req.body, req.file);

    res.status(200).json({
        success: true,
        message: 'Course lecture added successfully',
        course,
    });
});

export const removeLectureFromCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, lectureId } = req.query;

    if (!courseId || !lectureId) {
        return next(new AppError('Course ID and Lecture ID are required', 400));
    }

    await courseService.removeLecture(courseId as string, lectureId as string);

    res.status(200).json({
        success: true,
        message: 'Course lecture removed successfully',
    });
});

export const updateCourseById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const course = await courseService.updateCourse(id, req.body, req.file);

    res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        course // Optional: return updated course
    });
});

export const deleteCourseById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await courseService.deleteCourse(id);

    res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
    });
});

export const addHomeworkToLecture = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { courseId, lectureId } = req.params;
    const homework = await courseService.addHomework(courseId, lectureId, req.body);

    res.status(201).json({
        success: true,
        message: 'Homework added to lecture',
        homework,
    });
});

export const removeHomeworkFromLecture = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { courseId, lectureId, hwId } = req.params;
    await courseService.removeHomework(courseId, lectureId, hwId);

    res.status(200).json({
        success: true,
        message: 'Homework removed from lecture',
    });
});

export const getQuestionSolution = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { courseId, lectureId, hwId, questionId } = req.params;
    const solution = await courseService.getQuestionSolution(courseId, lectureId, hwId, questionId);

    res.status(200).json({
        success: true,
        solution,
    });
});

export const updateLectureNotes = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { courseId, lectureId } = req.params;
    const { notes } = req.body;
    const updatedNotes = await courseService.updateNotes(courseId, lectureId, notes);

    res.status(200).json({
        success: true,
        message: 'Lecture notes updated',
        notes: updatedNotes,
    });
});

export const removeQuestionFromHomework = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { courseId, lectureId, hwId, questionId } = req.params;
    await courseService.removeQuestion(courseId, lectureId, hwId, questionId);

    res.status(200).json({
        success: true,
        message: 'Question removed from homework'
    });
});
