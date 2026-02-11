import { z } from 'zod';

export const createPastPaperSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        courseId: z.string().min(1, 'Course ID is required'),
        visionSolutions: z.string().optional(), // JSON string
    }),
});

export const addVisionSolutionSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        questionNumber: z.string().min(1, 'Question Number is required'),
        solutionContent: z.string().min(1, 'Solution Content is required'),
        relatedLectureId: z.string().optional(),
    }),
});
