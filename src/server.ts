import dotenv from "dotenv";
import path from "path";

// Load environment variables
const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error("⚠️  AVISO: JWT_SECRET não está configurado no arquivo .env");
  console.error(
    "   Por favor, verifique se o arquivo .env existe na raiz do projeto e que a variável JWT_SECRET está definida"
  );
}

import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";
import unidadesRoutes from "./routes/services/unidadesRoutes";
import pessoasRoutes from "./routes/services/pessoasRoutes";
import infraestruturaRoutes from "./routes/services/infraestruturaRoutes";
import localizacaoRoutes from "./routes/services/localizacaoRoutes";
import { swaggerUi, specs } from "./config/swagger";

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message:
      "Bem-vindo ao API Gateway do sistema de Gestão de Unidades. Acesse a documentação para mais informações.",
    documentation:
      "https://seciteci-sigu-api-gateway.qmono1.easypanel.host/api/v1/docs",
  });
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "API Gateway está em execução" });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página inicial da API
 *     description: Retorna informações básicas sobre a API Gateway
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Informações da API retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 message:
 *                   type: string
 *                   example: "Bem-vindo ao API Gateway do sistema de Gestão de Unidades. Acesse a documentação para mais informações."
 *                 documentation:
 *                   type: string
 *                   example: "https://api-gateway.unidades.com.br/api/v1/docs"
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar saúde da API
 *     description: Endpoint para verificar se a API Gateway está funcionando corretamente
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: API funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 message:
 *                   type: string
 *                   example: "API Gateway está em execução"
 */

// Swagger documentation endpoint (deve vir ANTES das rotas protegidas)
app.use(`${API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(specs));

// Authentication routes
app.use(`${API_PREFIX}/auth`, authRoutes);

// Microservices proxy routes (estas já incluem autenticação interna)
app.use(`${API_PREFIX}/unidades`, unidadesRoutes);
app.use(`${API_PREFIX}/pessoas`, pessoasRoutes);
app.use(`${API_PREFIX}/infraestrutura`, infraestruturaRoutes);
app.use(`${API_PREFIX}/localizacao`, localizacaoRoutes);

// Outras rotas protegidas específicas
app.use(`${API_PREFIX}`, protectedRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Error handler
const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error:", err);
  const status = (err as any).status || 500;
  res.status(status).json({
    error: err.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `[\x1b[32m OK \x1b[0m] API Gateway server rodando na porta ${PORT}`
  );
  console.log(`[INFO] API prefix: ${API_PREFIX}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
