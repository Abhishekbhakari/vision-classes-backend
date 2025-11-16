import { model, Schema, Types } from 'mongoose';
import {
  ICourse,
  ICourseModel,
  ILecture,
  IHomework,
  IQuestion,
  IAttachment,
} from './course.interface.js';

const AttachmentSchema = new Schema<IAttachment>({
  filename: String,
  url: String,
});

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    solution: { type: String },
    attachments: [AttachmentSchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const HomeworkSchema = new Schema<IHomework>(
  {
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuestionSchema],
    dueDate: { type: Date },
    points: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LectureSchema = new Schema<ILecture>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    lecture: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    homeworks: [HomeworkSchema],
    notes: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const courseSchema = new Schema<ICourse, ICourseModel>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [8, 'Title must be at least 8 characters'],
      maxlength: [50, 'Title cannot be more than 50 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be atleast 20 characters long'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    lectures: [LectureSchema],
    thumbnail: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: [true, 'Course instructor name is required'],
    },
    price: {
      type: Number,
      default: 0,
    },
    enrolledUsers: [{
      type: String, // Store user IDs of enrolled/paid users
    }],
  },
  {
    timestamps: true,
  }
);

const Course = model<ICourse, ICourseModel>('Course', courseSchema);

export default Course;