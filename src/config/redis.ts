import Redis from 'ioredis'
import { redisLogger } from './logger'

let redisClient: Redis | null = null

export const connectRedis = (): Redis => {
   if (redisClient) {
      return redisClient
   }

   const redisUrl = process.env.REDIS_URL

   if (!redisUrl) {
      redisLogger.warn('REDIS_URL não está configurado. Cache desabilitado.')
      // Retorna um cliente mock que não faz nada
      return new Redis({
         host: 'localhost',
         port: 6379,
         retryStrategy: () => null, // Não tenta reconectar
         lazyConnect: true,
      })
   }

   try {
      redisClient = new Redis(redisUrl, {
         retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000)
            return delay
         },
         maxRetriesPerRequest: 3,
      })

      redisClient.on('connect', () => {
         redisLogger.info('Redis conectado com sucesso')
      })

      redisClient.on('error', (error) => {
         redisLogger.error({ error }, 'Erro no Redis')
      })

      return redisClient
   } catch (error) {
      redisLogger.error({ error }, 'Erro ao conectar ao Redis')
      throw error
   }
}

export const getRedisClient = (): Redis | null => {
   return redisClient
}

export const disconnectRedis = async (): Promise<void> => {
   if (redisClient) {
      await redisClient.quit()
      redisClient = null
      redisLogger.info('Redis desconectado')
   }
}
