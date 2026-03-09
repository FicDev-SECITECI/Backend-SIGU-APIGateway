import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env')
dotenv.config({ path: envPath })

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
   console.error('⚠️  AVISO: JWT_SECRET não está configurado no arquivo .env')
   console.error(
      '   Por favor, verifique se o arquivo .env existe na raiz do projeto e que a variável JWT_SECRET está definida',
   )
}

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth'
import unidadesRoutes from './routes/services/unidadesRoutes'
import pessoasRoutes from './routes/services/pessoasRoutes'
import infraestruturaRoutes from './routes/services/infraestruturaRoutes'
import localizacaoRoutes from './routes/services/localizacaoRoutes'
import protectedRoutes from './routes/protected'
import { swaggerUi, specs, swaggerUiOptions } from './config/swagger'
import { connectMongoDB } from './config/database'
import { connectRedis } from './config/redis'
import User from './models/User'

const app = express()
const PORT = process.env.PORT || 3000
const API_PREFIX = process.env.API_PREFIX || '/api/v1'

// Security middleware
app.use(
   helmet({
      contentSecurityPolicy: {
         directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
         },
      },
      hsts: {
         maxAge: 31536000,
         includeSubDomains: true,
         preload: true,
      },
   }),
)

// CORS configuration
app.use(
   cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
   }),
)

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 5, // limit each IP to 5 requests per windowMs
   message: {
      error: 'Muitas tentativas de login, tente novamente em 15 minutos',
      retryAfter: 15 * 60, // seconds
   },
   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
   skipSuccessfulRequests: true, // Don't count successful requests
})

// General rate limiting
const generalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100, // limit each IP to 100 requests per windowMs
   message: {
      error: 'Muitas requisições do mesmo IP, tente novamente mais tarde',
      retryAfter: 15 * 60, // seconds
   },
   standardHeaders: true,
   legacyHeaders: false,
})

// Apply general rate limiting to all requests
app.use(generalLimiter)

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
   next()
})

app.get('/', (_req: Request, res: Response) => {
   res.json({
      status: 'ok',
      message:
         'Bem-vindo ao API Gateway do sistema de Gestão de Unidades. Acesse a documentação para mais informações.',
      documentation: 'https://seciteci-sigu-api-gateway.qmono1.easypanel.host/api/v1/docs',
   })
})

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
   res.json({ status: 'ok', message: 'API Gateway está em execução' })
})

// Serve raw JSON spec (this is what makes the download link work)
app.get('/api/v1/docs/swagger.json', (req, res) => {
   res.json(specs)
})

// Swagger UI — must come AFTER the JSON route
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions))

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
app.use(`${API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(specs))

// Authentication routes with rate limiting
app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes)

// Microservices proxy routes (estas já incluem autenticação interna)
app.use(`${API_PREFIX}/unidades`, unidadesRoutes)
app.use(`${API_PREFIX}/pessoas`, pessoasRoutes)
app.use(`${API_PREFIX}/infraestrutura`, infraestruturaRoutes)
app.use(`${API_PREFIX}/localizacao`, localizacaoRoutes)

// Protected routes (users, profile, dashboard, etc.)
app.use(`${API_PREFIX}`, protectedRoutes)

// Outras rotas protegidas específicas
// Removido: app.use(`${API_PREFIX}`, protectedRoutes); - estava interceptando tudo

// 404 handler
app.use((_req: Request, res: Response) => {
   res.status(404).json({ error: 'Rota não encontrada' })
})

// Error handler
const errorHandler: ErrorRequestHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
   console.error('Error:', err)
   const status = (err as any).status || 500
   res.status(status).json({
      error: err.message || 'Erro interno do servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
   })
}

app.use(errorHandler)

// Inicializa conexões e inicia servidor
const startServer = async () => {
   try {
      // Conecta ao MongoDB
      await connectMongoDB()

      // Conecta ao Redis
      connectRedis()

      // Inicializa usuário admin
      await User.initializeAdmin()

      // Inicia servidor
      app.listen(PORT, () => {
         console.log(`[\x1b[32m OK \x1b[0m] API Gateway server rodando na porta ${PORT}`)
         console.log(`[INFO] API prefix: ${API_PREFIX}`)
         console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`)
      })
   } catch (error) {
      console.error('❌ Erro ao iniciar servidor:', error)
      process.exit(1)
   }
}

startServer()

export default app
