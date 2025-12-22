import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import * as protectedController from '../controllers/protectedController';

const router = express.Router();

// Apply authentication middleware to all routes in this file
router.use(authenticateToken);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/users', authorizeRoles('admin'), protectedController.getAllUsers);

/**
 * @route   GET /api/v1/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protectedController.getProfile);

/**
 * @route   GET /api/v1/dashboard
 * @desc    Example protected route
 * @access  Private
 */
router.get('/dashboard', protectedController.getDashboard);

/**
 * @route   GET /api/v1/admin-only
 * @desc    Example admin-only route
 * @access  Private (Admin)
 */
router.get('/admin-only', authorizeRoles('admin'), protectedController.getAdminOnly);

export default router;

