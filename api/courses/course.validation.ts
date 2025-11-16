import { z } from 'zod';
import { Types } from 'mongoose';

const isMongooseId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid MongoDB ObjectId',
});

export const createCourseSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(8, 'Title must be at least 8 characters')
      .max(50, 'Title cannot be more than 50 characters'),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters'),
    category: z.string().min(1, 'Category is required'),
    createdBy: z.string().min(1, 'Instructor name is required'),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: isMongooseId,
  }),
  body: z.object({
    title: z.string().min(8).max(50).optional(),
    description: z.string().min(20).optional(),
    category: z.string().min(1).optional(),
    createdBy: z.string().min(1).optional(),
  }),
});

export const addLectureSchema = z.object({
  params: z.object({
    id: isMongooseId,
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
  }),
});

export const removeLectureSchema = z.object({
  query: z.object({
    courseId: isMongooseId,
    lectureId: isMongooseId,
  }),
});

export const addHomeworkSchema = z.object({
  params: z.object({
    courseId: isMongooseId,
    lectureId: isMongooseId,
  }),
  body: z.object({
    title: z.string().min(1, 'Homework title is required'),
    description: z.string().optional(),
    // We'll let the service handle question creation
  }),
});

export const removeHomeworkSchema = z.object({
  params: z.object({
    courseId: isMongooseId,
    lectureId: isMongooseId,
    hwId: isMongooseId,
  }),
});

export const getSolutionSchema = z.object({
  params: z.object({
    courseId: isMongooseId,
    lectureId: isMongooseId,
    hwId: isMongooseId,
    questionId: isMongooseId,
  }),
});

export const updateNotesSchema = z.object({
  params: z.object({
    courseId: isMongooseId,
    lectureId: isMongooseId,
  }),
  body: z.object({
    notes: z.string(), // Can be empty string
  }),
});