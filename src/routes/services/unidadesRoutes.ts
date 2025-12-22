import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { createProxy } from "../../middleware/proxyMiddleware";

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

/**
 * Proxy para o serviço de Unidades
 * Todas as requisições para /api/v1/unidades/* serão encaminhadas para o serviço de Unidades.
 *
 * Exemplo:
 *  - Cliente chama:   GET /api/v1/unidades/:id
 *  - Gateway envia:   GET UNIDADES_SERVICE_URL/api/unidades/:id
 */
router.use(
  "/",
  createProxy({
    serviceName: "unidades",
    pathPrefix: "/api/unidades",
    stripPrefix: false,
  })
);

export default router;
