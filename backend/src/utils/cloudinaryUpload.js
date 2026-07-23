import cloudinary from '../config/cloudinary.js';
import AppError from './AppError.js';

export const uploadToCloudinary = async (fileBuffer, folder = 'shoe-ecommerce') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(new AppError(`Image upload failed: ${error.message}`, 500));
        else
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
      }
    );
    stream.end(fileBuffer);
  });
};

export const uploadMultipleToCloudinary = async (files, folder) => {
  const uploads = files.map((file) => uploadToCloudinary(file.buffer, folder));
  return Promise.all(uploads);
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

export const deleteMultipleFromCloudinary = async (publicIds = []) => {
  await Promise.all(publicIds.filter(Boolean).map(deleteFromCloudinary));
};
