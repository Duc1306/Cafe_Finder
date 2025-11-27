import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  return jwt.sign({ id}, secret, { expiresIn: process.env.expiresIn || '7d' });
};
