import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { createProxy } from "../../middleware/proxyMiddleware";

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/infraestrutura:
 *   get:
 *     summary: Listar todas as infraestruturas
 *     description: Retorna uma lista de todas as infraestruturas cadastradas no sistema
 *     tags: [Infraestrutura]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de infraestruturas retornada com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       503:
 *         description: Serviço de Infraestrutura indisponível
 *   post:
 *     summary: Criar nova infraestrutura
 *     description: Cria uma nova infraestrutura no sistema
 *     tags: [Infraestrutura]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Dados da infraestrutura a ser criada
 *     responses:
 *       201:
 *         description: Infraestrutura criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       503:
 *         description: Serviço de Infraestrutura indisponível
 *
 * /api/v1/infraestrutura/{id}:
 *   get:
 *     summary: Obter infraestrutura por ID
 *     description: Retorna os detalhes de uma infraestrutura específica
 *     tags: [Infraestrutura]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID da infraestrutura
 *     responses:
 *       200:
 *         description: Infraestrutura encontrada
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Infraestrutura não encontrada
 *       503:
 *         description: Serviço de Infraestrutura indisponível
 *   put:
 *     summary: Atualizar infraestrutura
 *     description: Atualiza os dados de uma infraestrutura existente
 *     tags: [Infraestrutura]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID da infraestrutura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Dados atualizados da infraestrutura
 *     responses:
 *       200:
 *         description: Infraestrutura atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Infraestrutura não encontrada
 *       503:
 *         description: Serviço de Infraestrutura indisponível
 *   delete:
 *     summary: Excluir infraestrutura
 *     description: Remove uma infraestrutura do sistema
 *     tags: [Infraestrutura]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID da infraestrutura
 *     responses:
 *       204:
 *         description: Infraestrutura excluída com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Infraestrutura não encontrada
 *       503:
 *         description: Serviço de Infraestrutura indisponível
 */
router.use(
  "/*",
  createProxy({
    serviceName: "infraestrutura",
    pathPrefix: "/api/v1",
    stripPrefix: false,
  })
);

export default router;
