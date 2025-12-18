// src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for cafe photos
const cafeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'cafe_finder/cafes',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `cafe_${Date.now()}_${Math.round(Math.random() * 1E9)}`,
    };
  },
});

// Storage for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'cafe_finder/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `avatar_${Date.now()}_${Math.round(Math.random() * 1E9)}`,
    };
  },
});

module.exports = {
  cloudinary,
  cafeStorage,
  avatarStorage,
};
