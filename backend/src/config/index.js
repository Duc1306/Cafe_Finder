require('dotenv').config();


const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

const corsConfig = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

// Xuất ra theo chuẩn CommonJS
module.exports = {
  jwtConfig,
  corsConfig
  // dbConfig
};