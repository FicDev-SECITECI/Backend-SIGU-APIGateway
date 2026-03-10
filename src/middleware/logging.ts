import { Request, Response, NextFunction } from 'express'
import { httpLogger, authLogger, dbLogger, redisLogger, proxyLogger } from '../config/logger'

interface RequestWithId extends Request {
   id?: string
   startTime?: number
}

/**
 * Generate a unique request ID
 */
const generateRequestId = (): string => {
   return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Logging middleware to capture HTTP requests and responses
 */
export const requestLogging = (req: RequestWithId, res: Response, next: NextFunction): void => {
   // Generate request ID if not already present
   req.id = req.id || generateRequestId()
   req.startTime = Date.now()

   // Log incoming request
   httpLogger.info(
      {
         requestId: req.id,
         method: req.method,
         url: req.originalUrl,
         ip: req.ip,
         userAgent: req.get('User-Agent'),
         contentLength: req.get('Content-Length'),
      },
      'Incoming request',
   )

   // Capture the original end function
   const originalEnd = res.end

   // Override res.end to log response
   res.end = function (chunk?: any, encoding?: any): Response {
      const responseTime = Date.now() - (req.startTime || Date.now())

      // Determine log level based on status code
      const logLevel = res.statusCode >= 400 ? 'warn' : 'info'

      httpLogger[logLevel](
         {
            requestId: req.id,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            contentLength: res.get('Content-Length'),
            ip: req.ip,
         },
         'Request completed',
      )

      // Call the original end function
      return originalEnd.call(this, chunk, encoding) as Response
   }

   next()
}

/**
 * Log user authentication events
 */
export const logAuthEvent = (event: string, userId?: string, email?: string, metadata?: any): void => {
   authLogger.info(
      {
         event,
         userId,
         email,
         ...metadata,
      },
      `Auth event: ${event}`,
   )
}

/**
 * Log database operations
 */
export const logDbOperation = (operation: string, collection: string, metadata?: any): void => {
   dbLogger.info(
      {
         operation,
         collection,
         ...metadata,
      },
      `Database operation: ${operation}`,
   )
}

/**
 * Log Redis operations
 */
export const logRedisOperation = (operation: string, key?: string, metadata?: any): void => {
   redisLogger.info(
      {
         operation,
         key,
         ...metadata,
      },
      `Redis operation: ${operation}`,
   )
}

/**
 * Log proxy operations
 */
export const logProxyOperation = (
   serviceName: string,
   targetUrl: string,
   statusCode?: number,
   metadata?: any,
): void => {
   const logLevel = statusCode && statusCode >= 400 ? 'warn' : 'info'

   proxyLogger[logLevel](
      {
         serviceName,
         targetUrl,
         statusCode,
         ...metadata,
      },
      `Proxy operation to ${serviceName}`,
   )
}

export default requestLogging
