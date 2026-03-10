import pino from 'pino'
import path from 'path'

// Define log levels
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

// Get log level from environment, default to 'info'
const getLogLevel = (): LogLevel => {
   const level = process.env.LOG_LEVEL?.toLowerCase()
   if (level && ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(level)) {
      return level as LogLevel
   }
   return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

// Check if we should use pretty printing (development only)
const usePrettyPrint = process.env.NODE_ENV !== 'production' && process.env.LOG_PRETTY !== 'false'

// Create logger instance
export const logger = pino({
   level: getLogLevel(),
   formatters: {
      level: (label) => {
         return { level: label.toUpperCase() }
      },
   },
   timestamp: pino.stdTimeFunctions.isoTime,
   base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || require('os').hostname(),
   },
   ...(usePrettyPrint
      ? {
           transport: {
              target: 'pino-pretty',
              options: {
                 colorize: true,
                 ignore: 'pid,hostname',
                 translateTime: 'yyyy-mm-dd HH:MM:ss',
                 singleLine: true,
              },
           },
        }
      : {
           // Production configuration
           destination: process.env.LOG_FILE_PATH || path.join(process.cwd(), 'logs', 'app.log'),
           mkdir: true,
        }),
})

// Create child loggers for different contexts
export const httpLogger = logger.child({ component: 'http' })
export const authLogger = logger.child({ component: 'auth' })
export const dbLogger = logger.child({ component: 'database' })
export const redisLogger = logger.child({ component: 'redis' })
export const proxyLogger = logger.child({ component: 'proxy' })
export const errorLogger = logger.child({ component: 'error' })

// Export convenience methods
export const log = {
   trace: (msg: string, ...args: any[]) => logger.trace(msg, ...args),
   debug: (msg: string, ...args: any[]) => logger.debug(msg, ...args),
   info: (msg: string, ...args: any[]) => logger.info(msg, ...args),
   warn: (msg: string, ...args: any[]) => logger.warn(msg, ...args),
   error: (msg: string, ...args: any[]) => logger.error(msg, ...args),
   fatal: (msg: string, ...args: any[]) => logger.fatal(msg, ...args),
}

export default logger
