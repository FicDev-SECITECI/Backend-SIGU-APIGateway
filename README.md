# Express API Gateway with User Authentication

A Node.js Express server implementation of an API Gateway with JWT-based user authentication, role-based access control, and protected routes. Built with TypeScript and comprehensive unit tests.

## Features

- 🔐 JWT-based authentication
- 🔑 User registration and login
- 🛡️ Protected routes with authentication middleware
- 👥 Role-based access control (admin/user)
- ✅ Input validation using express-validator
- 🔒 Password hashing with bcryptjs
- 📦 Modular and scalable architecture
- 📝 TypeScript for type safety
- 🧪 Comprehensive unit tests with Jest

## Project Structure

```
.
├── src/
│   ├── server.ts              # Main server entry point
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── routes/
│   │   ├── auth.ts           # Authentication routes (register, login)
│   │   ├── protected.ts     # Protected API routes
│   │   └── __tests__/        # Route tests
│   ├── middleware/
│   │   ├── auth.ts           # Authentication and authorization middleware
│   │   └── __tests__/        # Middleware tests
│   └── models/
│       ├── User.ts           # User model (in-memory storage)
│       └── __tests__/        # Model tests
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
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
API_PREFIX=/api/v1
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

#### Get Current User (Protected)

```
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

#### Get User Profile

```
GET /api/v1/profile
Authorization: Bearer <token>
```

#### Dashboard

```
GET /api/v1/dashboard
Authorization: Bearer <token>
```

#### Get All Users (Admin Only)

```
GET /api/v1/users
Authorization: Bearer <admin-token>
```

#### Admin Only Endpoint

```
GET /api/v1/admin-only
Authorization: Bearer <admin-token>
```

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

### Access protected route:

```bash
curl -X GET http://localhost:3000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Default Admin Credentials

For testing purposes, a default admin user is created:

- **Email:** admin@example.com
- **Password:** admin123

⚠️ **Important:** Change the default admin password in production!

## Authentication Flow

1. User registers or logs in through `/api/v1/auth/register` or `/api/v1/auth/login`
2. Server returns a JWT token in the response
3. Client includes the token in the `Authorization` header for protected routes
4. Middleware validates the token and attaches user info to `req.user`

## Middleware

### `authenticateToken`

Validates JWT token from the Authorization header and attaches user data to `req.user`.

### `authorizeRoles(...roles)`

Ensures the authenticated user has one of the specified roles (e.g., 'admin').

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

1. **Database Integration:** Replace the in-memory user storage with a proper database (MongoDB, PostgreSQL, etc.)

2. **Environment Variables:** Use secure environment variables and never commit `.env` files

3. **JWT Secret:** Use a strong, randomly generated secret key for JWT signing

4. **HTTPS:** Always use HTTPS in production to protect tokens in transit

5. **Rate Limiting:** Implement rate limiting to prevent brute-force attacks

6. **Token Refresh:** Consider implementing refresh tokens for better security

7. **Password Policy:** Enforce stronger password requirements

8. **Input Sanitization:** Add additional input sanitization beyond validation

9. **Logging:** Implement proper logging and monitoring

10. **CORS:** Configure CORS properly for your frontend domain

## License

ISC
