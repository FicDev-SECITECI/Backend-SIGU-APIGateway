import { Request } from 'express';
import { Types } from 'mongoose';

export interface User {
  _id?: Types.ObjectId;
  id?: string | number; // Compatibilidade: MongoDB ObjectId como string ou número
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface JwtPayload {
  id: string; // MongoDB ObjectId como string
  email: string;
  role: 'user' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

