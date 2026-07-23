import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import AppError from './AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsRoot = path.join(__dirname, '../../uploads');

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

ensureDir(path.join(uploadsRoot, 'products'));

const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (jpeg, png, webp, gif) are allowed', 400), false);
  }
};

/** Memory storage — used by non-product uploads (still Cloudinary-based) */
const memoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

export const uploadSingle = (fieldName = 'image') => upload.single(fieldName);
export const uploadMultiple = (fieldName = 'images', maxCount = 10) =>
  upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

/** Disk storage — product images saved under /uploads/products */
const productDiskStorage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(uploadsRoot, 'products');
    ensureDir(dir);
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${safeExt}`);
  },
});

export const productUpload = multer({
  storage: productDiskStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

export const uploadProductImages = (maxCount = 10) =>
  productUpload.array('images', maxCount);
