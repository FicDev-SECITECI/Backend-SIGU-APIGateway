import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios';
import { ServicesConfig, getServiceConfig } from '../config/services';
import { AuthenticatedRequest } from '../types';

export interface ProxyOptions {
  serviceName: keyof ServicesConfig;
  pathPrefix: string;
  stripPrefix?: boolean;
}

/**
 * Cria um middleware de proxy para fazer requisições a microserviços
 */
export const createProxy = (options: ProxyOptions) => {
  const { serviceName, pathPrefix, stripPrefix = false } = options;

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const serviceConfig = getServiceConfig(serviceName);
      
      // Usa o path original da requisição
      let targetPath = req.path;
      
      // Se stripPrefix estiver ativado, remove o prefixo
      if (stripPrefix && targetPath.startsWith(pathPrefix)) {
        targetPath = targetPath.replace(pathPrefix, '');
      }
      
      // Garante que o path comece com /
      if (!targetPath.startsWith('/')) {
        targetPath = `/${targetPath}`;
      }
      
      // Constrói a URL completa do serviço
      // Exemplo: http://localhost:3001/api/v1/unidades/123
      const targetUrl = `${serviceConfig.baseUrl}${pathPrefix}${targetPath}`;

      // Prepara headers para forward
      const headers: Record<string, string> = {
        'content-type': req.headers['content-type'] || 'application/json',
        'x-forwarded-for': req.ip || req.socket.remoteAddress || '',
        'x-forwarded-host': req.get('host') || '',
        'x-original-path': req.originalUrl || req.url,
      };

      // Adiciona informações do usuário autenticado se disponível
      if (req.user) {
        headers['x-user-id'] = req.user.id.toString();
        headers['x-user-email'] = req.user.email;
        headers['x-user-role'] = req.user.role;
      }

      // Forward do token de autorização se presente
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        headers['authorization'] = authHeader;
      }

      // Log da requisição
      console.log(
        `[Proxy] ${req.method} ${req.path} -> ${serviceName} (${targetUrl})`
      );

      // Faz a requisição ao microserviço
      const response = await axios({
        method: req.method as any,
        url: targetUrl,
        headers,
        data: Object.keys(req.body).length > 0 ? req.body : undefined,
        params: req.query,
        timeout: serviceConfig.timeout,
        validateStatus: () => true, // Aceita todos os status codes
      });

      // Retorna a resposta do microserviço
      res.status(response.status);
      
      // Copia headers relevantes da resposta
      const responseHeaders = ['content-type', 'content-length'];
      responseHeaders.forEach((header) => {
        if (response.headers[header]) {
          res.set(header, response.headers[header] as string);
        }
      });

      res.json(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // O serviço respondeu com um erro
        res.status(axiosError.response.status);
        res.json(axiosError.response.data || { error: 'Erro no serviço' });
      } else if (axiosError.code === 'ECONNREFUSED') {
        // Serviço não está disponível
        console.error(`[Proxy Error] Serviço ${serviceName} não está disponível`);
        res.status(503).json({
          error: 'Serviço indisponível',
          service: serviceName,
          message: `O serviço ${serviceName} está temporariamente indisponível`,
        });
      } else if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
        // Timeout
        console.error(`[Proxy Error] Timeout do serviço ${serviceName}`);
        res.status(504).json({
          error: 'Timeout do serviço',
          service: serviceName,
          message: `O serviço ${serviceName} não respondeu a tempo`,
        });
      } else {
        // Erro desconhecido
        console.error(`[Proxy Error] Erro inesperado para ${serviceName}:`, error);
        res.status(500).json({
          error: 'Erro interno do servidor',
          service: serviceName,
          message: 'Ocorreu um erro inesperado ao processar sua requisição',
        });
      }
    }
  };
};

