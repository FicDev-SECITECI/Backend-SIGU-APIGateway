import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { createProxy } from "../../middleware/proxyMiddleware";

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

/**
 * Proxy para o serviço de Pessoas
 * Todas as requisições para /api/v1/pessoas/* serão encaminhadas para o serviço de Pessoas
 */
router.use(
  "/",
  createProxy({
    serviceName: "pessoas",
    pathPrefix: "",
    stripPrefix: false,
  })
);

export default router;
