import express from 'express';
import { authenticateToken } from '../../middleware/auth';
import { createProxy } from '../../middleware/proxyMiddleware';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

/**
 * Proxy para o serviço de Localização
 * Todas as requisições para /api/v1/localizacao/* serão encaminhadas para o serviço de Localização
 */
router.use(
  '/*',
  createProxy({
    serviceName: 'localizacao',
    pathPrefix: '/api/v1',
    stripPrefix: false,
  })
);

export default router;

