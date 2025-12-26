import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import * as protectedController from '../controllers/protectedController';

const router = express.Router();

// Apply authentication middleware to all routes in this file
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Listar todos os usuários (apenas admin)
 *     description: Retorna uma lista de todos os usuários cadastrados no sistema. Requer privilégios de administrador.
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado - requer privilégios de administrador
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/users', authorizeRoles('admin'), protectedController.getAllUsers);

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Obter perfil do usuário atual
 *     description: Retorna as informações detalhadas do usuário atualmente autenticado
 *     tags: [Usuários]
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
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/profile', protectedController.getProfile);

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Painel de controle
 *     description: Retorna informações gerais do sistema para usuários autenticados
 *     tags: [Sistema]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do painel retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bem-vindo ao painel"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     role:
 *                       type: string
 *                       example: "user"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                           example: 10
 *                         activeSessions:
 *                           type: integer
 *                           example: 1
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dashboard', protectedController.getDashboard);

/**
 * @swagger
 * /api/v1/admin-only:
 *   get:
 *     summary: Endpoint exclusivo para administradores
 *     description: Endpoint de exemplo que só pode ser acessado por usuários com privilégios de administrador
 *     tags: [Sistema]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Acesso concedido para administradores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Este é um endpoint exclusivo para administradores"
 *                 adminInfo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "admin@example.com"
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado - requer privilégios de administrador
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/admin-only', authorizeRoles('admin'), protectedController.getAdminOnly);

export default router;

