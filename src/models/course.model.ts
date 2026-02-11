import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestion {
    _id?: Types.ObjectId;
    text: string;
    solution?: string;
    attachments: { filename: string; url: string }[];
    options?: { a?: string; b?: string; c?: string; d?: string };
    correctAnswer?: string;
    order: number;
}

export interface IHomework {
    _id?: Types.ObjectId;
    title: string;
    description?: string;
    type?: 'homework' | 'quiz';
    questions: IQuestion[];
    dueDate?: Date;
    points: number;
    order: number;
}

export interface ILecture {
    _id?: Types.ObjectId;
    title?: string;
    description?: string;
    lecture: {
        public_id: string;
        secure_url: string;
    };
    homeworks: IHomework[];
    notes?: string;
    xpReward: number;
    order: number;
}

export interface ICourse extends Document {
    title: string;
    description: string;
    category: string;
    price: number;
    lectures: ILecture[];
    thumbnail: {
        public_id: string;
        secure_url: string;
    };
    numberOfLectures: number;
    createdBy: string;
}

const QuestionSchema = new Schema(
    {
        text: { type: String, required: true },
        solution: { type: String },
        attachments: [
            {
                filename: String,
                url: String,
            },
        ],
        options: {
            a: { type: String },
            b: { type: String },
            c: { type: String },
            d: { type: String },
        },
        correctAnswer: { type: String },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const HomeworkSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        type: { type: String, enum: ['homework', 'quiz'], default: 'homework' },
        questions: [QuestionSchema],
        dueDate: { type: Date },
        points: { type: Number, default: 0 },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const LectureSchema = new Schema(
    {
        title: String,
        description: String,
        lecture: {
            public_id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true,
            },
        },
        homeworks: [HomeworkSchema],
        notes: { type: String },
        xpReward: { type: Number, default: 100 },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const courseSchema = new Schema<ICourse>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            minlength: [8, 'Title must be atleast 8 characters'],
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
        price: {
            type: Number,
            required: [true, 'Price is required'],
            default: 0,
        },
        lectures: [LectureSchema],
        thumbnail: {
            public_id: {
                type: String,
            },
            secure_url: {
                type: String,
            },
        },
        numberOfLectures: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: String,
            required: [true, 'Course instructor name is required'],
        },
    },
    {
        timestamps: true,
    }
);

const Course = model<ICourse>('Course', courseSchema);

export default Course;
