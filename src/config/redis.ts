import Redis from 'ioredis';

let redisClient: Redis | null = null;

export const connectRedis = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('⚠️  REDIS_URL não está configurado. Cache desabilitado.');
    // Retorna um cliente mock que não faz nada
    return new Redis({
      host: 'localhost',
      port: 6379,
      retryStrategy: () => null, // Não tenta reconectar
      lazyConnect: true,
    });
  }

  try {
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis conectado com sucesso');
    });

    redisClient.on('error', (error) => {
      console.error('❌ Erro no Redis:', error);
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Erro ao conectar ao Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): Redis | null => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis desconectado');
  }
};

