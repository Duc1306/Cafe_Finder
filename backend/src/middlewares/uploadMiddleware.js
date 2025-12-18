const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cafeStorage } = require('../config/cloudinary');

// Check if we're using Cloudinary (production) or local storage (development)
const useCloudinary = process.env.NODE_ENV === 'production' || process.env.USE_CLOUDINARY === 'true';

let storage;

if (useCloudinary) {
  // Use Cloudinary storage for production
  storage = cafeStorage;
} else {
  // Use local disk storage for development
  const uploadDir = path.join(__dirname, '../../uploads/cafes');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Tạo tên file unique: timestamp-randomnumber-originalname
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
    }
  });
}

// Filter file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, JPEG, WEBP are allowed.'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;