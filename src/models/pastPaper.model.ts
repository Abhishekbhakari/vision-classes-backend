import { Schema, model, Document, Types } from 'mongoose';

export interface IVisionSolution {
    _id?: Types.ObjectId;
    questionNumber: string;
    solutionContent: string;
    relatedLectureId?: Types.ObjectId;
}

export interface IPastPaper extends Document {
    title: string;
    courseId: Types.ObjectId;
    questionPaperPDF: {
        public_id: string;
        secure_url: string;
    };
    markingSchemePDF: {
        public_id: string;
        secure_url: string;
    };
    visionSolutions: IVisionSolution[];
}

const visionSolutionSchema = new Schema({
    questionNumber: {
        type: String,
        required: true,
    },
    solutionContent: {
        type: String, // HTML or Rich Text
        required: true,
    },
    relatedLectureId: {
        type: Schema.Types.ObjectId,
        ref: 'Course.lectures',
    },
});

const pastPaperSchema = new Schema<IPastPaper>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        questionPaperPDF: {
            public_id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true,
            },
        },
        markingSchemePDF: {
            public_id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true,
            },
        },
        visionSolutions: [visionSolutionSchema],
    },
    {
        timestamps: true,
    }
);

const PastPaper = model<IPastPaper>('PastPaper', pastPaperSchema);

export default PastPaper;
