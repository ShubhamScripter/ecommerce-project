import fs from 'fs';
import path from 'path';
import { uploadsRoot } from './upload.js';

/**
 * Map multer diskStorage files to Product.images shape.
 * public_id = relative path under uploads/ (used for delete)
 * url = public URL path served by Express static
 */
export const mapDiskFilesToImages = (files = [], alt = '') =>
  files.map((file, index) => ({
    public_id: `products/${file.filename}`,
    url: `/uploads/products/${file.filename}`,
    alt,
    sortOrder: index,
  }));

/** Delete a local upload by public_id (e.g. products/123.jpg). Skips remote/seed ids. */
export const deleteLocalFile = (publicId) => {
  if (!publicId || typeof publicId !== 'string') return;
  if (publicId.startsWith('http') || publicId.startsWith('seed/')) return;
  if (publicId.includes('..')) return;

  const filePath = path.join(uploadsRoot, publicId);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Local file delete error:', err.message);
    }
  }
};

export const deleteLocalFiles = (publicIds = []) => {
  publicIds.forEach(deleteLocalFile);
};
