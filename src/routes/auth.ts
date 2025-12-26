import express from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import * as authController from "../controllers/authController";

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário no sistema
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             username: "johndoe"
 *             email: "john@example.com"
 *             password: "password123"
 *             role: "user"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos ou usuário já existe
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/schemas/ValidationError'
 *               - $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
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
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Fazer login
 *     description: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
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
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Obter perfil do usuário atual
 *     description: Retorna as informações do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/me", authenticateToken, authController.getMe);

export default router;
