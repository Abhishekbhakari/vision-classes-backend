import fs from 'fs/promises';
import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { asyncHandler } from '../../utils/asyncHandler.js';
import Course from './course.model.js';
import AppError from '../../utils/appError.js';
import { HttpCode } from '../../constants/httpCode.js';
import { ICourse, ILecture } from './course.interface.js';
import { Types } from 'mongoose';

// Input types
type CreateCourseInput = {
  title: string;
  description: string;
  category: string;
  createdBy: string;
};
type UpdateCourseInput = Partial<CreateCourseInput>;

type AddLectureInput = {
  title: string;
  description: string;
};

type AddHomeworkInput = {
  title: string;
  description?: string;
};

type UpdateNotesInput = {
  notes: string;
};

class CourseService {
  /**
   * @description Get all courses
   */
  public async getAllCourses(): Promise<ICourse[]> {
    // Select only necessary fields for the list view
    return await Course.find({}).select('-lectures');
  }

  /**
   * @description Get all lectures for a specific course
   */
  public async getLecturesByCourseId(courseId: string): Promise<ILecture[]> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', HttpCode.NOT_FOUND);
    }
    return course.lectures;
  }

  /**
   * @description Create a new course
   */
  public async createCourse(
    input: CreateCourseInput,
    thumbnailFile: Express.Multer.File | undefined
  ): Promise<ICourse> {
    if (!thumbnailFile) {
      throw new AppError('Thumbnail file is required', HttpCode.BAD_REQUEST);
    }

    let thumbnailUrl = { public_id: '', secure_url: '' };
    try {
      const result = await cloudinary.uploader.upload(thumbnailFile.path, {
        folder: 'lms/thumbnails',
        width: 250,
      });
      if (result) {
        thumbnailUrl = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      }
    } catch (error: any) {
      throw new AppError(
        error.message || 'Thumbnail upload failed',
        HttpCode.BAD_REQUEST
      );
    } finally {
      await fs.rm(thumbnailFile.path);
    }

    const course = await Course.create({
      ...input,
      thumbnail: thumbnailUrl,
    });

    return course;
  }

  /**
   * @description Update an existing course
   */
  public async updateCourse(
    courseId: string,
    input: UpdateCourseInput
  ): Promise<ICourse> {
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $set: input },
      { new: true, runValidators: true } // Return updated doc & run validators
    );
    if (!course) {
      throw new AppError('Course not found', HttpCode.NOT_FOUND);
    }
    return course;
  }

  /**
   * @description Delete a course by ID
   */
  public async deleteCourse(courseId: string): Promise<void> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', HttpCode.NOT_FOUND);
    }

    // Delete thumbnail from Cloudinary
    await cloudinary.uploader.destroy(course.thumbnail.public_id);

    // TODO: Delete all lecture videos from Cloudinary (requires iterating)
    for (const lecture of course.lectures) {
      await cloudinary.uploader.destroy(lecture.lecture.public_id, {
        resource_type: 'video',
      });
    }

    await Course.findByIdAndDelete(courseId);
  }

  /**
   * @description Add a lecture to a course
   */
  public async addLecture(
    courseId: string,
    input: AddLectureInput,
    lectureFile: Express.Multer.File | undefined
  ): Promise<ILecture> {
    if (!lectureFile) {
      throw new AppError('Lecture file is required', HttpCode.BAD_REQUEST);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', HttpCode.NOT_FOUND);
    }

    let lectureUrl = { public_id: '', secure_url: '' };
    try {
      const result = await cloudinary.uploader.upload(lectureFile.path, {
        folder: 'lms/lectures',
        resource_type: 'video',
      });
      if (result) {
        lectureUrl = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      }
    } catch (error: any) {
      throw new AppError(
        error.message || 'Lecture video upload failed',
        HttpCode.BAD_REQUEST
      );
    } finally {
      await fs.rm(lectureFile.path);
    }

    const newLecture = {
      ...input,
      lecture: lectureUrl,
    };

    course.lectures.push(newLecture as ILecture);
    course.numberOfLectures = course.lectures.length;
    await course.save();

    return newLecture as ILecture;
  }

  /**
   * @description Remove a lecture from a course
   */
  public async removeLecture(
    courseId: string,
    lectureId: string
  ): Promise<void> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', HttpCode.NOT_FOUND);
    }

    const lectureIndex = course.lectures.findIndex(
      (l) => l._id?.toString() === lectureId
    );
    if (lectureIndex === -1) {
      throw new AppError('Lecture not found', HttpCode.NOT_FOUND);
    }

    const lecture = course.lectures[lectureIndex];

    // Delete lecture video from Cloudinary
    await cloudinary.uploader.destroy(lecture.lecture.public_id, {
      resource_type: 'video',
    });

    course.lectures.splice(lectureIndex, 1);
    course.numberOfLectures = course.lectures.length;
    await course.save();
  }

  // --- Homework & Notes ---

  public async addHomework(
    courseId: string,
    lectureId: string,
    input: AddHomeworkInput
  ) {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', HttpCode.NOT_FOUND);

    const lecture = course.lectures.find(
      (l) => l._id?.toString() === lectureId
    );
    if (!lecture) throw new AppError('Lecture not found', HttpCode.NOT_FOUND);

    lecture.homeworks.push(input as any); // Mongoose will cast
    await course.save();
    return lecture.homeworks[lecture.homeworks.length - 1]; // Return new homework
  }

  public async removeHomework(
    courseId: string,
    lectureId: string,
    hwId: string
  ) {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', HttpCode.NOT_FOUND);

    const lecture = course.lectures.find(
      (l) => l._id?.toString() === lectureId
    );
    if (!lecture) throw new AppError('Lecture not found', HttpCode.NOT_FOUND);

    const hwIndex = lecture.homeworks.findIndex(
      (hw) => hw._id?.toString() === hwId
    );
    if (hwIndex === -1)
      throw new AppError('Homework not found', HttpCode.NOT_FOUND);

    lecture.homeworks.splice(hwIndex, 1);
    await course.save();
  }

  public async getQuestionSolution(
    courseId: string,
    lectureId: string,
    hwId: string,
    questionId: string
  ) {
    const course = await Course.findById(courseId).select(
      'lectures.homeworks.questions'
    );
    if (!course) throw new AppError('Course not found', HttpCode.NOT_FOUND);

    const lecture = course.lectures.find(
      (l) => l._id?.toString() === lectureId
    );
    if (!lecture) throw new AppError('Lecture not found', HttpCode.NOT_FOUND);

    const homework = lecture.homeworks.find(
      (hw) => hw._id?.toString() === hwId
    );
    if (!homework)
      throw new AppError('Homework not found', HttpCode.NOT_FOUND);

    const question = homework.questions.find(
      (q) => q._id?.toString() === questionId
    );
    if (!question)
      throw new AppError('Question not found', HttpCode.NOT_FOUND);

    return question.solution;
  }

  public async updateLectureNotes(
    courseId: string,
    lectureId: string,
    input: UpdateNotesInput
  ) {
    const course = await Course.findOneAndUpdate(
      { _id: courseId, 'lectures._id': lectureId },
      { $set: { 'lectures.$.notes': input.notes } },
      { new: true }
    );

    if (!course) {
      throw new AppError('Course or lecture not found', HttpCode.NOT_FOUND);
    }
  }
}

export const courseController = {
  getAllCourses: asyncHandler(async (_req: Request, res: Response) => {
    const courses = await courseService.getAllCourses();
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Courses fetched successfully',
      courses,
    });
  }),

  getLecturesByCourseId: asyncHandler(async (req: Request, res: Response) => {
    const courseId = (req.params.courseId ?? req.params.id) as string;
    const lectures = await courseService.getLecturesByCourseId(courseId);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Lectures fetched successfully',
      lectures,
    });
  }),

  createCourse: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.createCourse(
      req.body,
      req.file
    );
    res.status(HttpCode.CREATED).json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  }),

  updateCourse: asyncHandler(async (req: Request, res: Response) => {
    const courseId = (req.params.courseId ?? req.params.id) as string;
    const course = await courseService.updateCourse(courseId, req.body);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  }),

  deleteCourse: asyncHandler(async (req: Request, res: Response) => {
    const courseId = (req.params.courseId ?? req.params.id) as string;
    await courseService.deleteCourse(courseId);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Course deleted successfully',
    });
  }),

  addLecture: asyncHandler(async (req: Request, res: Response) => {
    const courseId = (req.params.courseId ?? req.params.id) as string;
    const lecture = await courseService.addLecture(
      courseId,
      req.body,
      req.file
    );
    res.status(HttpCode.CREATED).json({
      success: true,
      message: 'Lecture added successfully',
      lecture,
    });
  }),

  removeLecture: asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.query;
    const { lectureId } = req.query;
    await courseService.removeLecture(
      courseId as string,
      lectureId as string
    );
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Lecture removed successfully',
    });
  }),

  addHomework: asyncHandler(async (req: Request, res: Response) => {
    const { courseId, lectureId } = req.params;
    const homework = await courseService.addHomework(
      courseId,
      lectureId,
      req.body
    );
    res.status(HttpCode.CREATED).json({
      success: true,
      message: 'Homework added successfully',
      homework,
    });
  }),

  removeHomework: asyncHandler(async (req: Request, res: Response) => {
    const { courseId, lectureId, hwId } = req.params;
    await courseService.removeHomework(courseId, lectureId, hwId);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Homework removed successfully',
    });
  }),

  getQuestionSolution: asyncHandler(async (req: Request, res: Response) => {
    const { courseId, lectureId, hwId, questionId } = req.params;
    const solution = await courseService.getQuestionSolution(
      courseId,
      lectureId,
      hwId,
      questionId
    );
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Solution fetched successfully',
      solution,
    });
  }),

  updateLectureNotes: asyncHandler(async (req: Request, res: Response) => {
    const { courseId, lectureId } = req.params;
    await courseService.updateLectureNotes(
      courseId,
      lectureId,
      req.body
    );
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Lecture notes updated successfully',
    });
  }),
};

const courseService = new CourseService();