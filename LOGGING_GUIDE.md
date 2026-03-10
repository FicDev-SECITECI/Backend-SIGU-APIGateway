# Structured Logging Implementation Guide

This document explains the structured logging implementation added to the API Gateway project.

## Overview

The project now uses **Pino** as the structured logging library, providing:

- JSON-formatted logs that are machine-readable
- Proper log levels (trace, debug, info, warn, error, fatal)
- Request/response logging with timing
- Structured context and metadata
- Environment-based configuration
- Log rotation support

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Logging Configuration
LOG_LEVEL=info                    # Log level: trace, debug, info, warn, error, fatal
LOG_PRETTY=true                   # Enable pretty printing in development
LOG_FILE_PATH=./logs/app.log     # Log file path for production
```

### Default Configuration

- **Development**: Uses pretty printing with debug level
- **Production**: Logs to file with info level
- **Log Format**: JSON with timestamps, process info, and structured metadata

## Log Levels

- **trace**: Very detailed logs for debugging
- **debug**: Detailed information for development
- **info**: General information about application flow
- **warn**: Warning messages for potential issues
- **error**: Error messages for failed operations
- **fatal**: Critical errors that cause application shutdown

## Components

### 1. Central Logger (`src/config/logger.ts`)

The main logging configuration with:

- Global logger instance
- Child loggers for different components
- Environment-based transport configuration

```typescript
import { logger, httpLogger, authLogger, dbLogger, redisLogger, proxyLogger } from './config/logger'

// Basic logging
logger.info('Application started')

// Component-specific logging
httpLogger.info('HTTP request received')
authLogger.warn('Authentication failed')
```

### 2. Request Logging Middleware (`src/middleware/logging.ts`)

Automatically logs all HTTP requests and responses:

- Request method, URL, IP, user agent
- Response status, timing, content length
- Request ID for traceability
- Automatic log level based on response status

### 3. Component-Specific Logging

#### Database Operations

```typescript
dbLogger.info({ operation: 'connect', database: 'mongodb' }, 'Database connected')
dbLogger.error({ error: err, operation: 'query' }, 'Database query failed')
```

#### Authentication Events

```typescript
authLogger.info({ userId: '123', email: 'user@example.com' }, 'User logged in')
authLogger.warn({ email: 'invalid@example.com' }, 'Invalid login attempt')
```

#### Redis Operations

```typescript
redisLogger.info({ operation: 'get', key: 'user:123' }, 'Cache hit')
redisLogger.error({ error: err, operation: 'set' }, 'Cache write failed')
```

#### Proxy Operations

```typescript
proxyLogger.info({ serviceName: 'unidades', targetUrl: 'http://localhost:3001' }, 'Proxy request')
proxyLogger.warn({ serviceName: 'unidades', statusCode: 503 }, 'Service unavailable')
```

## Log Examples

### Development (Pretty Printed)

```
[16:30:15.123] INFO (12345 on hostname): Incoming request
    requestId: "abc123"
    method: "POST"
    url: "/api/v1/auth/login"
    ip: "127.0.0.1"
    userAgent: "Mozilla/5.0..."

[16:30:15.456] INFO (12345 on hostname): Request completed
    requestId: "abc123"
    method: "POST"
    url: "/api/v1/auth/login"
    statusCode: 200
    responseTime: "333ms"
    contentLength: "256"
```

### Production (JSON)

```json
{
   "level": "INFO",
   "time": "2026-03-10T16:30:15.123Z",
   "pid": 12345,
   "hostname": "hostname",
   "component": "http",
   "requestId": "abc123",
   "method": "POST",
   "url": "/api/v1/auth/login",
   "ip": "127.0.0.1",
   "userAgent": "Mozilla/5.0...",
   "msg": "Incoming request"
}
```

## Usage in Controllers

### Before (Console Logging)

```typescript
console.log('User registered:', username)
console.error('Database error:', error)
```

### After (Structured Logging)

```typescript
logger.info({ username, email }, 'User registered successfully')
logger.error({ error, userId: user.id }, 'Database operation failed')
```

## Usage in Middleware

### Authentication Logging

```typescript
export const authenticateToken = (req, res, next) => {
   if (!token) {
      authLogger.warn({ ip: req.ip, path: req.path }, 'Missing authentication token')
      return res.status(401).json({ error: 'Token required' })
   }
   // ...
}
```

### Proxy Logging

```typescript
export const createProxy = (options) => {
   return async (req, res, next) => {
      proxyLogger.info(
         {
            serviceName: options.serviceName,
            targetUrl: targetUrl,
            method: req.method,
            userId: req.user?.id,
         },
         'Proxy request started',
      )
      // ...
   }
}
```

## Error Handling

The error handler now uses structured logging:

```typescript
const errorHandler = (err, req, res, next) => {
   logger.error(
      {
         error: err.message,
         stack: err.stack,
         requestId: req.id,
         path: req.path,
         method: req.method,
         userId: req.user?.id,
      },
      'Unhandled error occurred',
   )

   res.status(500).json({ error: 'Internal server error' })
}
```

## Monitoring and Debugging

### Request Tracing

Every request gets a unique ID that appears in all related logs:

- Request start
- Authentication events
- Database operations
- Proxy calls
- Response completion
- Error handling

### Performance Monitoring

Response times are automatically logged:

- Fast requests: info level
- Slow requests: warn level (configurable)
- Failed requests: error level

### Security Events

Authentication and authorization events are logged:

- Login attempts (success/failure)
- Token validation errors
- Permission denied errors
- Suspicious activity patterns

## Best Practices

### 1. Use Appropriate Log Levels

- **info**: Normal application flow
- **warn**: Potential issues that don't break functionality
- **error**: Failed operations that affect user experience
- **debug**: Detailed information for troubleshooting

### 2. Include Relevant Context

```typescript
// Good
logger.error(
   {
      error: err.message,
      userId: user.id,
      operation: 'user_creation',
      timestamp: new Date().toISOString(),
   },
   'Failed to create user',
)

// Avoid
logger.error('Something went wrong')
```

### 3. Don't Log Sensitive Information

```typescript
// Good
logger.info({ userId: user.id, email: user.email }, 'User updated')

// Avoid
logger.info({ user: user }, 'User updated') // Logs password hash
```

### 4. Use Component-Specific Loggers

```typescript
// Use the right logger for the context
httpLogger.info('HTTP request processed')
authLogger.warn('Authentication failed')
dbLogger.error('Database connection lost')
```

## Log Rotation

In production, configure log rotation using tools like:

- **logrotate** (Linux)
- **Winston** with file rotation
- **Pino** with external rotation tools

Example logrotate configuration:

```
/path/to/logs/app.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 user group
}
```

## Integration with Monitoring Tools

The structured JSON logs work well with:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki**
- **Datadog**
- **New Relic**
- **Splunk**

Example Kibana query:

```
component:"http" AND status:500
```

## Testing

The logging implementation includes:

- Unit tests for logger configuration
- Integration tests for middleware
- Mock loggers for test environments
- Verification of log structure and content

Run tests with:

```bash
npm test
npm run test:coverage
```

## Migration Guide

### From Console Logging

1. Import the appropriate logger
2. Replace `console.log` with `logger.info`
3. Replace `console.error` with `logger.error`
4. Add structured context
5. Remove sensitive information

### From Other Logging Libraries

1. Update imports to use Pino
2. Convert log levels to Pino format
3. Update log message format
4. Configure transports and serializers
5. Update log aggregation configurations

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check LOG_LEVEL environment variable
2. **Missing context**: Ensure you're passing structured objects
3. **Performance issues**: Use appropriate log levels in production
4. **Log file permissions**: Check file system permissions for LOG_FILE_PATH

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

### Production Debugging

For production debugging:

```bash
LOG_LEVEL=warn npm start  # Only warnings and errors
```

## Future Enhancements

Potential improvements:

- Custom log serializers for sensitive data
- Log sampling for high-volume endpoints
- Integration with distributed tracing (OpenTelemetry)
- Custom metrics from log data
- Alerting based on log patterns
