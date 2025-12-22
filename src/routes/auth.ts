import express from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import * as authController from "../controllers/authController";

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("O nome de usuário deve ter entre 3 e 30 caracteres"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Por favor, forneça um email válido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("A senha deve ter pelo menos 6 caracteres"),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("A função deve ser 'user' ou 'admin'"),
  ],
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Por favor, forneça um email válido"),
    body("password").notEmpty().withMessage("A senha é obrigatória"),
  ],
  authController.login
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticateToken, authController.getMe);

export default router;
