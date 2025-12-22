import { Request } from 'express';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface UserPublic {
  id: number;
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
  id: number;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

