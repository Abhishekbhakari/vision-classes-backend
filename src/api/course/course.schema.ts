import { z } from 'zod';

export const createCourseSchema = z.object({
    body: z.object({
        title: z.string().min(8, 'Title must be at least 8 characters').max(50, 'Title cannot be more than 50 characters'),
        description: z.string().min(20, 'Description must be at least 20 characters'),
        category: z.string().min(1, 'Category is required'),
        createdBy: z.string().min(1, 'Created by is required'),
        price: z.string().or(z.number()).optional(), // Handle string input from form-data
    }),
});

export const updateCourseSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        title: z.string().min(8).max(50).optional(),
        description: z.string().min(20).optional(),
        category: z.string().optional(),
        price: z.string().or(z.number()).optional(),
        createdBy: z.string().optional(),
    }),
});

export const addLectureSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
    }),
});

export const addHomeworkSchema = z.object({
    params: z.object({
        courseId: z.string(),
        lectureId: z.string(),
    }),
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        questions: z.array(z.any()).optional(), 
        dueDate: z.string().optional(),
        points: z.number().or(z.string()).optional(),
        order: z.number().or(z.string()).optional(),
    }),
});

export const updateNotesSchema = z.object({
    params: z.object({
        courseId: z.string(),
        lectureId: z.string(),
    }),
    body: z.object({
        notes: z.string(),
    }),
});
