import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import * as progressService from './progress.service';

export const markLectureAsComplete = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { id } = req.user!;
        const { courseId, lectureId } = req.body;

        const progress = await progressService.markLectureComplete(id, courseId, lectureId);

        res.status(200).json({
            success: true,
            message: 'Lecture marked as complete',
            data: progress,
        });
    }
);

export const getCourseProgress = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { id } = req.user!;
        const { courseId } = req.params;

        const progress = await progressService.getProgress(id, courseId);

        res.status(200).json({
            success: true,
            message: 'Course progress fetched successfully',
            progress,
        });
    }
);
