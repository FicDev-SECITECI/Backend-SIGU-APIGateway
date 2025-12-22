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

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "API Gateway está em execução" });
});

// Authentication routes
app.use(`${API_PREFIX}/auth`, authRoutes);

// Protected routes
app.use(`${API_PREFIX}`, protectedRoutes);

// Microservices proxy routes
app.use(`${API_PREFIX}/unidades`, unidadesRoutes);
app.use(`${API_PREFIX}/pessoas`, pessoasRoutes);
app.use(`${API_PREFIX}/infraestrutura`, infraestruturaRoutes);
app.use(`${API_PREFIX}/localizacao`, localizacaoRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Error handler
const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
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
