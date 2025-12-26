import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Gateway - Sistema de Gestão de Unidades",
      version: "1.0.0",
      description:
        "API Gateway para o sistema de gestão de unidades com autenticação JWT e roteamento de microserviços",
      contact: {
        name: "Equipe SIGU",
        email: "contato@sigu.com.br",
      },
    },
    servers: [
      {
        url: "https://seciteci-sigu-api-gateway.qmono1.easypanel.host/",
        description: "Servidor de produção",
      },
      {
        url: "http://localhost:3000",
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Token JWT obtido através do endpoint /api/v1/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            username: {
              type: "string",
              example: "johndoe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "user",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2023-12-01T10:00:00.000Z",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              example: "password123",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              example: "johndoe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "password123",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "user",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Login realizado com sucesso",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Mensagem de erro",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  msg: {
                    type: "string",
                    example: "Campo obrigatório",
                  },
                  param: {
                    type: "string",
                    example: "email",
                  },
                  location: {
                    type: "string",
                    example: "body",
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/routes/auth.ts",
    "./src/routes/protected.ts",
    "./src/routes/services/unidadesRoutes.ts",
    "./src/routes/services/pessoasRoutes.ts",
    "./src/routes/services/infraestruturaRoutes.ts",
    "./src/routes/services/localizacaoRoutes.ts",
    "./src/server.ts",
  ],
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
