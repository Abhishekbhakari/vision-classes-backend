import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
    storage: multer.diskStorage({
        destination: 'uploads/',
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
            cb(null, file.originalname);
        },
    }),
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        let ext = path.extname(file.originalname);

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.webp' && ext !== '.png' && ext !== '.mp4' && ext !== '.pdf') {
            cb(new Error(`Unsupported file type! ${ext}`));
            return;
        }

        cb(null, true);
    },
});

export default upload;
