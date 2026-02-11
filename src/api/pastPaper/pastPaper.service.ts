import fs from 'fs/promises';
import PastPaper, { IPastPaper, IVisionSolution } from '../../models/pastPaper.model';
import Course from '../../models/course.model';
import AppError from '../../utils/AppError';
import cloudinary from '../../config/cloudinary';

interface CreatePastPaperData {
    title: string;
    courseId: string;
    visionSolutions?: string;
}

export const create = async (data: CreatePastPaperData, files: { [fieldname: string]: Express.Multer.File[] }) => {
    const { title, courseId, visionSolutions } = data;

    if (!title || !courseId) {
        throw new AppError('Title and Course ID are required', 400);
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError('Course not found', 404);
    }

    if (!files || !files.questionPaper || !files.markingScheme) {
        throw new AppError('Both Question Paper and Marking Scheme PDFs are required', 400);
    }

    const questionPaperUpload = await cloudinary.uploader.upload(files.questionPaper[0].path, {
        folder: 'lms/pastpapers',
        resource_type: 'raw',
        format: 'pdf',
    });

    const markingSchemeUpload = await cloudinary.uploader.upload(files.markingScheme[0].path, {
        folder: 'lms/pastpapers',
        resource_type: 'raw',
        format: 'pdf',
    });

    await fs.unlink(files.questionPaper[0].path);
    await fs.unlink(files.markingScheme[0].path);

    let parsedSolutions: IVisionSolution[] = [];
    if (visionSolutions) {
        try {
            parsedSolutions = JSON.parse(visionSolutions);
        } catch (error) {
            parsedSolutions = visionSolutions as any;
        }
    }

    const pastPaper = await PastPaper.create({
        title,
        courseId,
        questionPaperPDF: {
            public_id: questionPaperUpload.public_id,
            secure_url: questionPaperUpload.secure_url,
        },
        markingSchemePDF: {
            public_id: markingSchemeUpload.public_id,
            secure_url: markingSchemeUpload.secure_url,
        },
        visionSolutions: parsedSolutions,
    });

    return pastPaper;
};

export const getByCourse = async (courseId: string) => {
    return await PastPaper.find({ courseId }).sort({ createdAt: -1 });
};

export const getById = async (id: string) => {
    const pastPaper = await PastPaper.findById(id);
    if (!pastPaper) {
        throw new AppError('Past Paper not found', 404);
    }
    return pastPaper;
};

export const deletePaper = async (id: string) => {
    const pastPaper = await PastPaper.findById(id);
    if (!pastPaper) {
        throw new AppError('Past Paper not found', 404);
    }

    await cloudinary.uploader.destroy(pastPaper.questionPaperPDF.public_id, { resource_type: 'raw' });
    await cloudinary.uploader.destroy(pastPaper.markingSchemePDF.public_id, { resource_type: 'raw' });

    await PastPaper.findByIdAndDelete(id);
};

export const addSolution = async (id: string, data: IVisionSolution) => {
    const { questionNumber, solutionContent, relatedLectureId } = data;

    if (!questionNumber || !solutionContent) {
        throw new AppError('Question Number and Solution Content are required', 400);
    }

    const pastPaper = await PastPaper.findById(id);
    if (!pastPaper) {
        throw new AppError('Past Paper not found', 404);
    }

    pastPaper.visionSolutions.push({
        questionNumber,
        solutionContent,
        relatedLectureId,
    });

    await pastPaper.save();
    return pastPaper;
};

export const deleteSolution = async (id: string, solutionId: string) => {
    const pastPaper = await PastPaper.findById(id);
    if (!pastPaper) {
        throw new AppError('Past Paper not found', 404);
    }

    pastPaper.visionSolutions = pastPaper.visionSolutions.filter(
        (sol) => (sol as any)._id.toString() !== solutionId
    );

    await pastPaper.save();
    return pastPaper;
};
