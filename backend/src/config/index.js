// Database configuration for PostgreSQL
import dotenv from 'dotenv';
dotenv.config();

// export const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   database: process.env.DB_NAME || 'cafe_finder_db',
//   username: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || '',
//   dialect: 'postgres',
//   logging: process.env.NODE_ENV === 'development' ? console.log : false,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// };

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

export const corsConfig = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};
