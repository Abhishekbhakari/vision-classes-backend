import fs from 'fs/promises';
import path from 'path';
import Course, { ICourse, ILecture, IHomework, IQuestion } from '../../models/course.model';
import AppError from '../../utils/AppError';
import cloudinary from '../../config/cloudinary';
import { Types } from 'mongoose';

export const getAll = async (category?: string) => {
    const pipeline: any[] = [];
    if (category) {
        pipeline.push({ $match: { category } });
    }

    // Add a computed field with the count of lectures and remove the lectures array
    pipeline.push({
        $addFields: {
            numberOfLectures: { $size: { $ifNull: ['$lectures', []] } },
        },
    });

    pipeline.push({ $project: { lectures: 0 } });

    const results = await Course.aggregate(pipeline);
    return results;
};

export const create = async (data: Partial<ICourse>, file?: Express.Multer.File) => {
    const { title, description, category, createdBy, price } = data;

    if (!title || !description || !category || !createdBy) {
        throw new AppError('All fields are required', 400);
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        price: Number(price) || 0,
    });

    if (!course) {
        throw new AppError('Course could not be created, please try again', 400);
    }

    if (file) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'lms',
            });

            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }

            await fs.rm(`uploads/${file.filename}`);
        } catch (error: any) {
            for (const f of await fs.readdir('uploads/')) {
                await fs.unlink(path.join('uploads/', f));
            }
            throw new AppError(error.message || 'File not uploaded, please try again', 400);
        }
    }

    await course.save();
    return course;
};

export const getLectures = async (id: string) => {
    const course = await Course.findById(id);
    if (!course) {
        throw new AppError('Invalid course id or course not found.', 404);
    }
    return course.lectures;
};

export const addLecture = async (id: string, data: { title: string; description: string }, file: Express.Multer.File) => {
    const { title, description } = data;

    if (!title || !description) {
        throw new AppError('Title and Description are required', 400);
    }

    const course = await Course.findById(id);
    if (!course) {
        throw new AppError('Invalid course id or course not found.', 400);
    }

    let lectureData: any = {};

    if (file) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'lms',
                chunk_size: 50000000, // 50 mb
                resource_type: 'video',
            });

            if (result) {
                lectureData.public_id = result.public_id;
                lectureData.secure_url = result.secure_url;
            }

            await fs.rm(`uploads/${file.filename}`);
        } catch (error: any) {
            for (const f of await fs.readdir('uploads/')) {
                await fs.unlink(path.join('uploads/', f));
            }
            throw new AppError(error.message || 'File not uploaded, please try again', 400);
        }
    } else {
        throw new AppError('Video file (req.file) is required', 400);
    }

    course.lectures.push({
        title,
        description,
        lecture: lectureData,
        homeworks: [],
        notes: '',
        xpReward: 100,
        order: course.lectures.length,
    } as ILecture);

    course.numberOfLectures = course.lectures.length;
    await course.save();

    return course;
};

export const removeLecture = async (courseId: string, lectureId: string) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError('Invalid ID or Course does not exist.', 404);
    }

    const lectureIndex = course.lectures.findIndex((l) => (l as any)._id.toString() === lectureId);
    if (lectureIndex === -1) {
        throw new AppError('Lecture does not exist.', 404);
    }

    await cloudinary.uploader.destroy(course.lectures[lectureIndex].lecture.public_id, {
        resource_type: 'video',
    });

    course.lectures.splice(lectureIndex, 1);
    course.numberOfLectures = course.lectures.length;
    await course.save();
};

export const updateCourse = async (id: string, data: Partial<ICourse>, file?: Express.Multer.File) => {
    const course = await Course.findById(id);
    if (!course) {
        throw new AppError('Invalid course id or course not found.', 400);
    }

    if (data.title) course.title = data.title;
    if (data.description) course.description = data.description;
    if (data.category) course.category = data.category;
    if (data.price) course.price = Number(data.price);
    if (data.createdBy) course.createdBy = data.createdBy;

    if (file) {
        if (course.thumbnail?.public_id) {
            await cloudinary.uploader.destroy(course.thumbnail.public_id);
        }
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'lms',
            });
            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }
            await fs.rm(`uploads/${file.filename}`);
        } catch (error: any) {
            throw new AppError(error.message || 'File upload failed', 400);
        }
    }

    await course.save();
    return course;
};

export const deleteCourse = async (id: string) => {
    const course = await Course.findById(id);
    if (!course) {
        throw new AppError('Course with given id does not exist.', 404);
    }
    await Course.findByIdAndDelete(id);
};

export const addHomework = async (courseId: string, lectureId: string, data: any) => {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    const lecture = course.lectures.find((l) => (l as any)._id.toString() === lectureId);
    if (!lecture) throw new AppError('Lecture not found', 404);


    let processedQuestions: IQuestion[] = [];
    if (data.questions && Array.isArray(data.questions)) {
        processedQuestions = data.questions
            .filter((q: any) => (q.text && q.text.trim()) || (q.question && q.question.trim())) // Only include questions with text
            .map((q: any) => ({
                text: q.text || q.question, // Map 'question' field to 'text' if needed
                solution: q.solution || q.answer || '', // Map 'answer' field to 'solution' if needed
                options: q.options || {},
                correctAnswer: q.correctAnswer || '',
                order: q.order !== undefined ? q.order : 0,
                attachments: q.attachments || []
            } as IQuestion));
    }

    // Create homework with transformed questions
    const homeworkData: IHomework = {
        title: data.title,
        description: data.description || '',
        type: data.type || 'homework',
        questions: processedQuestions,
        dueDate: data.dueDate,
        points: data.points || 0,
        order: lecture.homeworks.length
    };

    lecture.homeworks.push(homeworkData);
    await course.save();

    return lecture.homeworks[lecture.homeworks.length - 1];
};

export const removeHomework = async (courseId: string, lectureId: string, hwId: string) => {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    const lecture = course.lectures.find((l) => (l as any)._id.toString() === lectureId);
    if (!lecture) throw new AppError('Lecture not found', 404);

    const hwIndex = lecture.homeworks.findIndex((h) => (h as any)._id.toString() === hwId);
    if (hwIndex === -1) throw new AppError('Homework not found', 404);

    lecture.homeworks.splice(hwIndex, 1);
    await course.save();
};

export const getQuestionSolution = async (courseId: string, lectureId: string, hwId: string, questionId: string) => {
    const course = await Course.findById(courseId).lean();
    if (!course) throw new AppError('Course not found', 404);

    const lecture = course.lectures.find((l: any) => l._id.toString() === lectureId);
    if (!lecture) throw new AppError('Lecture not found', 404);

    const homework = lecture.homeworks.find((h: any) => h._id.toString() === hwId);
    if (!homework) throw new AppError('Homework not found', 404);

    const question = homework.questions.find((q: any) => q._id.toString() === questionId);
    if (!question) throw new AppError('Question not found', 404);

    return question.solution || '';
};

export const updateNotes = async (courseId: string, lectureId: string, notes: string) => {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    const lecture = course.lectures.find((l) => (l as any)._id.toString() === lectureId);
    if (!lecture) throw new AppError('Lecture not found', 404);

    lecture.notes = notes;
    await course.save();
    return lecture.notes;
};

export const removeQuestion = async (courseId: string, lectureId: string, hwId: string, questionId: string) => {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    const lecture = course.lectures.find((l) => (l as any)._id.toString() === lectureId);
    if (!lecture) throw new AppError('Lecture not found', 404);

    const homework = lecture.homeworks.find((h) => (h as any)._id.toString() === hwId);
    if (!homework) throw new AppError('Homework not found', 404);

    const qIndex = homework.questions.findIndex((q) => (q as any)._id.toString() === questionId);
    if (qIndex === -1) throw new AppError('Question not found', 404);

    homework.questions.splice(qIndex, 1);
    await course.save();
};
