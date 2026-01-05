import express from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import * as authController from "../controllers/authController";

const router = express.Router();

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

router.get("/me", authenticateToken, authController.getMe);

export default router;
