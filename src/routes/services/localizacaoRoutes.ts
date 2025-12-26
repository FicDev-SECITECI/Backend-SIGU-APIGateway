import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { createProxy } from "../../middleware/proxyMiddleware";

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/localizacao:
 *   get:
 *     summary: Listar todas as localizações
 *     description: Retorna uma lista de todas as localizações cadastradas no sistema
 *     tags: [Localização]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de localizações retornada com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       503:
 *         description: Serviço de Localização indisponível
 *   post:
 *     summary: Criar nova localização
 *     description: Cria uma nova localização no sistema
 *     tags: [Localização]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome da localização
 *               descricao:
 *                 type: string
 *                 description: Descrição da localização
 *               latitude:
 *                 type: number
 *                 description: Latitude da localização
 *               longitude:
 *                 type: number
 *                 description: Longitude da localização
 *             required:
 *               - nome
 *               - descricao
 *               - latitude
 *               - longitude
 *     responses:
 *       201:
 *         description: Localização criada com sucesso
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Token não fornecido ou inválido
 *       503:
 *         description: Serviço de Localização indisponível
 */

/**
 * Proxy para o serviço de Localização
 * Todas as requisições para /api/v1/localizacao/* serão encaminhadas para o serviço de Localização
 */
router.use(
  "/",
  createProxy({
    serviceName: "localizacao",
    pathPrefix: "/api/localizacoes",
    stripPrefix: false,
  })
);

export default router;
