// import { model, Schema } from 'mongoose';

// const courseSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: [true, 'Title is required'],
//       minlength: [8, 'Title must be atleast 8 characters'],
//       maxlength: [50, 'Title cannot be more than 50 characters'],
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: [true, 'Description is required'],
//       minlength: [20, 'Description must be atleast 20 characters long'],
//     },
//     category: {
//       type: String,
//       required: [true, 'Category is required'],
//     },
//     lectures: [
//       {
//         title: String,
//         description: String,
//         lecture: {
//           public_id: {
//             type: String,
//             required: true,
//           },
//           secure_url: {
//             type: String,
//             required: true,
//           },
//         },
//       },
//     ],
//     thumbnail: {
//       public_id: {
//         type: String,
//       },
//       secure_url: {
//         type: String,
//       },
//     },
//     numberOfLectures: {
//       type: Number,
//       default: 0,
//     },
//     createdBy: {
//       type: String,
//       required: [true, 'Course instructor name is required'],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Course = model('Course', courseSchema);

// export default Course;

import { model, Schema } from 'mongoose';

const QuestionSchema = new Schema(
  {
    text: { type: String, required: true },
    solution: { type: String }, // plain text / markdown / HTML
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const HomeworkSchema = new Schema(
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
    // NEW: homework array and notes per lecture
    homeworks: [HomeworkSchema],
    notes: { type: String }, // markdown / HTML
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const courseSchema = new Schema(
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
    // lectures now include homeworks + notes
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

const Course = model('Course', courseSchema);

export default Course;
