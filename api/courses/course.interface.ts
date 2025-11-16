import { Document, Model, Types } from 'mongoose';

// Interface for embedded Attachment
export interface IAttachment {
  filename: string;
  url: string;
}

// Interface for embedded Question
export interface IQuestion extends Document {
  text: string;
  solution?: string;
  attachments: IAttachment[];
  order: number;
}

// Interface for embedded Homework
export interface IHomework extends Document {
  title: string;
  description?: string;
  questions: IQuestion[];
  dueDate?: Date;
  points: number;
  order: number;
}

// Interface for embedded Lecture
export interface ILecture extends Document {
  title: string;
  description?: string;
  lecture: {
    public_id: string;
    secure_url: string;
  };
  homeworks: IHomework[];
  notes?: string;
  order: number;
}
 
// Interface for the main Course document
export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  lectures: ILecture[];
  thumbnail: {
    public_id: string;
    secure_url: string;
  };
  numberOfLectures: number;
  createdBy: string;
  price?: number;
  enrolledUsers?: string[];
}

// Interface for the Course model (for static methods, if any)
export interface ICourseModel extends Model<ICourse> {
  // Define static methods here if needed
}