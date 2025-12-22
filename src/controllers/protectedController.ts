import { Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

/**
 * Get all users (Admin only)
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const users = User.getAll();
    res.json({ users });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get current user profile
 * @route   GET /api/v1/profile
 * @access  Private
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

/**
 * Example protected route - Dashboard
 * @route   GET /api/v1/dashboard
 * @access  Private
 */
export const getDashboard = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Autenticação necessária' });
    return;
  }

  res.json({
    message: 'Bem-vindo ao painel',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
    data: {
      stats: {
        totalUsers: User.getAll().length,
        activeSessions: 1,
      },
    },
  });
};

/**
 * Example admin-only route
 * @route   GET /api/v1/admin-only
 * @access  Private (Admin)
 */
export const getAdminOnly = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Autenticação necessária' });
    return;
  }

  res.json({
    message: 'Este é um endpoint exclusivo para administradores',
    adminInfo: {
      id: req.user.id,
      email: req.user.email,
    },
  });
};

