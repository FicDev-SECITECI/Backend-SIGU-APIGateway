import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { createProxy } from "../../middleware/proxyMiddleware";

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

router.use(
  "/",
  createProxy({
    serviceName: "infraestrutura",
    pathPrefix: "/api",
    stripPrefix: false,
  })
);

export default router;
