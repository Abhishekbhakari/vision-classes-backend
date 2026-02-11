import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import * as pastPaperService from './pastPaper.service';

export const createPastPaper = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const pastPaper = await pastPaperService.create(req.body, req.files as { [fieldname: string]: Express.Multer.File[] });

    res.status(201).json({
        success: true,
        message: 'Past Paper created successfully',
        pastPaper,
    });
});

export const getPastPapersByCourse = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { courseId } = req.params;
    const pastPapers = await pastPaperService.getByCourse(courseId);

    res.status(200).json({
        success: true,
        message: 'Past Papers fetched successfully',
        pastPapers,
    });
});

export const getPastPaperById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const pastPaper = await pastPaperService.getById(id);

    res.status(200).json({
        success: true,
        message: 'Past Paper fetched successfully',
        pastPaper,
    });
});

export const deletePastPaper = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await pastPaperService.deletePaper(id);

    res.status(200).json({
        success: true,
        message: 'Past Paper deleted successfully',
    });
});

export const addVisionSolution = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const pastPaper = await pastPaperService.addSolution(id, req.body);

    res.status(200).json({
        success: true,
        message: 'Vision Solution added successfully',
        pastPaper,
    });
});

export const deleteVisionSolution = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id, solutionId } = req.params;
    const pastPaper = await pastPaperService.deleteSolution(id, solutionId);

    res.status(200).json({
        success: true,
        message: 'Vision Solution deleted successfully',
        pastPaper,
    });
});
