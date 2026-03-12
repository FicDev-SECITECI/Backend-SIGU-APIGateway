# Express API Gateway - SIGU (Sistema de Gestão de Unidades)

A Node.js Express API Gateway serving as the entry point for the SIGU architecture. It handles user authentication (JWT-based), role-based access control, rate limiting, and acts as a reverse proxy for downstream microservices. Built with TypeScript and comprehensive unit tests, persisting data in MongoDB and using Redis for caching and session management.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control (admin/user)
- 🔄 **Microservices Proxying**: Reverse proxy for downstream services (Unidades, Pessoas, Infraestrutura, Localizacao)
- 🗄️ **Database**: MongoDB (via Mongoose) for data persistence
- 🚀 **Cache & Sessions**: Redis (via ioredis) for caching and rate limiting
- 🛡️ **Security**: Helmet, CORS, and Express Rate Limit configurations
- ✅ **Validation**: Input validation using express-validator
- 🔒 **Security**: Password hashing with bcryptjs
- 📝 **Logging**: Structured logging with Pino
- 📚 **Documentation**: Swagger/OpenAPI integration
- 🧪 **Testing**: Comprehensive unit and integration tests with Jest

## Project Structure

```
.
├── src/
│   ├── server.ts              # Main server entry point
│   ├── config/                # Configurations (DB, Redis, Logger, Services, Swagger)
│   ├── controllers/           # Route controllers (auth, protected)
│   ├── middleware/            # Auth, logging, and proxy middlewares
│   ├── models/                # Mongoose schemas and models (User)
│   ├── routes/                # API Routes
│   │   ├── auth.ts            # Authentication routes
│   │   ├── protected.ts       # Protected API routes
│   │   └── services/          # Microservices proxy routes
│   ├── types/                 # TypeScript type definitions
│   └── __tests__/             # Test suites
├── dist/                      # Compiled JavaScript (generated)
├── coverage/                  # Test coverage reports (generated)
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest test configuration
└── package.json               # Dependencies and scripts
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory (copy from `.env.example`):

```bash
# Server Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database Configuration
MONGO_DB_URL=mongodb://localhost:27017/api-gateway

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://localhost:3000

# Microservices Configuration
UNIDADES_SERVICE_URL=http://localhost:3001
UNIDADES_SERVICE_TIMEOUT=5000

PESSOAS_SERVICE_URL=http://localhost:3002
PESSOAS_SERVICE_TIMEOUT=5000

INFRAESTRUTURA_SERVICE_URL=http://localhost:3003
INFRAESTRUTURA_SERVICE_TIMEOUT=5000

LOCALIZACAO_SERVICE_URL=http://localhost:3004
LOCALIZACAO_SERVICE_TIMEOUT=5000

# Logging Configuration
LOG_LEVEL=info
LOG_PRETTY=true
LOG_FILE_PATH=./logs/app.log
```

**Important:** Replace `JWT_SECRET` with a strong random string in production!

## Usage

### Development

For development with auto-reload:

```bash
npm run dev
```

### Production

Build the TypeScript code:

```bash
npm run build
```

Start the server:

```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

The coverage report will be available in the `coverage/` directory.

## API Endpoints

### Public Endpoints

#### Health Check

```
GET /health
```

#### API Documentation (Swagger)

```
GET /api/v1/docs
```

#### Register User

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional, defaults to "user"
}
```

#### Login

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

#### Get Current User

```
GET /api/v1/auth/me
Authorization: Bearer <token>
```

#### Proxy Routes (Microservices)

The API Gateway routes requests to internal microservices. These routes require authentication and include proxying of the user's data in headers.

- **Unidades Service:** `/api/v1/unidades/*`
- **Pessoas Service:** `/api/v1/pessoas/*`
- **Infraestrutura Service:** `/api/v1/infraestrutura/*`
- **Localizacao Service:** `/api/v1/localizacao/*`

_Note: The proxy middleware automatically forwards the `Authorization` header and injects user context (`x-user-id`, `x-user-email`, `x-user-role`)._

## Example Usage with cURL

### Register a new user:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Login:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Access a microservice (protected):

```bash
curl -X GET http://localhost:3000/api/v1/unidades \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Default Admin Credentials

For testing purposes, a default admin user is initialized:

- **Email:** admin@example.com
- **Password:** admin123

⚠️ **Important:** Change the default admin password in production!

## Authentication Flow

1. User registers or logs in through `/api/v1/auth/register` or `/api/v1/auth/login`
2. Server returns a JWT token in the response
3. Client includes the token in the `Authorization` header for protected routes
4. Middleware validates the token and attaches user info to `req.user`
5. Proxy middleware forwards the request to the appropriate microservice, passing along the authentication data.

## TypeScript

This project is written in TypeScript for better type safety and developer experience. The source code is in the `src/` directory and gets compiled to JavaScript in the `dist/` directory.

### Type Definitions

All TypeScript types are defined in `src/types/index.ts`:

- `User` - Internal user type with password
- `UserPublic` - Public user type without password
- `UserCreateData` - Data structure for creating users
- `JwtPayload` - JWT token payload structure
- `AuthenticatedRequest` - Extended Express Request with user info

## Production Considerations

1. **Environment Variables:** Use secure environment variables and never commit `.env` files
2. **JWT Secret:** Use a strong, randomly generated secret key for JWT signing
3. **HTTPS:** Always use HTTPS in production to protect tokens in transit
4. **Database:** Secure MongoDB and Redis instances. Do not expose them publicly.
5. **Rate Limiting:** Adjust rate limiting to prevent brute-force attacks based on production load.
6. **Token Refresh:** Consider implementing refresh tokens for better security
7. **Password Policy:** Enforce stronger password requirements
8. **Logging:** Monitor Pino logs and rotate log files properly.
9. **CORS:** Configure CORS to only allow specific frontend domains.
10.   **Microservices Network:** Ensure the microservices URLs are only accessible internally by the API Gateway.

## License

ISC
