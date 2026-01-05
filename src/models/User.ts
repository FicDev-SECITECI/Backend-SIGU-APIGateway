import bcrypt from "bcryptjs";
import { User, UserPublic, UserCreateData } from "../types";
import { UserModel as MongooseUserModel } from "./UserSchema";
import { getRedisClient } from "../config/redis";

// Cache TTL em segundos (5 minutos)
const CACHE_TTL = 300;

class UserModel {
  /**
   * Busca usuário por email com cache Redis
   */
  static async findByEmail(email: string): Promise<User | undefined> {
    const redis = getRedisClient();
    const cacheKey = `user:email:${email}`;

    // Tenta buscar do cache primeiro
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const user = JSON.parse(cached);
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role,
            createdAt: new Date(user.createdAt),
          };
        }
      } catch (error) {
        console.error("Erro ao buscar do cache Redis:", error);
      }
    }

    // Busca do MongoDB
    const user = await MongooseUserModel.findOne({
      email: email.toLowerCase(),
    }).lean();

    if (!user) {
      return undefined;
    }

    const userData: User = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
    };

    // Salva no cache
    if (redis) {
      try {
        await redis.setex(
          cacheKey,
          CACHE_TTL,
          JSON.stringify({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            createdAt: userData.createdAt.toISOString(),
          })
        );
      } catch (error) {
        console.error("Erro ao salvar no cache Redis:", error);
      }
    }

    return userData;
  }

  /**
   * Busca usuário por ID com cache Redis
   */
  static async findById(id: number | string): Promise<User | undefined> {
    const redis = getRedisClient();
    const cacheKey = `user:id:${id}`;

    // Tenta buscar do cache primeiro
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const user = JSON.parse(cached);
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role,
            createdAt: new Date(user.createdAt),
          };
        }
      } catch (error) {
        console.error("Erro ao buscar do cache Redis:", error);
      }
    }

    // Busca do MongoDB
    let user;
    try {
      user = await MongooseUserModel.findById(id).lean();
    } catch (error) {
      // ID inválido
      return undefined;
    }

    if (!user) {
      return undefined;
    }

    const userData: User = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
    };

    // Salva no cache
    if (redis) {
      try {
        await redis.setex(
          cacheKey,
          CACHE_TTL,
          JSON.stringify({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            createdAt: userData.createdAt.toISOString(),
          })
        );
      } catch (error) {
        console.error("Erro ao salvar no cache Redis:", error);
      }
    }

    return userData;
  }

  /**
   * Busca usuário por username com cache Redis
   */
  static async findByUsername(username: string): Promise<User | undefined> {
    const redis = getRedisClient();
    const cacheKey = `user:username:${username}`;

    // Tenta buscar do cache primeiro
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const user = JSON.parse(cached);
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role,
            createdAt: new Date(user.createdAt),
          };
        }
      } catch (error) {
        console.error("Erro ao buscar do cache Redis:", error);
      }
    }

    // Busca do MongoDB
    const user = await MongooseUserModel.findOne({ username }).lean();

    if (!user) {
      return undefined;
    }

    const userData: User = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
    };

    // Salva no cache
    if (redis) {
      try {
        await redis.setex(
          cacheKey,
          CACHE_TTL,
          JSON.stringify({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            createdAt: userData.createdAt.toISOString(),
          })
        );
      } catch (error) {
        console.error("Erro ao salvar no cache Redis:", error);
      }
    }

    return userData;
  }

  /**
   * Cria um novo usuário
   */
  static async create(userData: UserCreateData): Promise<UserPublic> {
    const { username, email, password, role = "user" } = userData;

    // Check if user already exists
    if (await this.findByEmail(email)) {
      throw new Error("Já existe um usuário com este email");
    }

    if (await this.findByUsername(username)) {
      throw new Error("Já existe um usuário com este nome de usuário");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria no MongoDB
    const newUser = new MongooseUserModel({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();

    const userPublic: UserPublic = {
      id: savedUser._id.toString(),
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
    };

    // Invalida cache relacionado (opcional, mas recomendado)
    const redis = getRedisClient();
    if (redis) {
      try {
        // Não precisa invalidar cache de busca específica pois é um novo usuário
        // Mas podemos limpar cache de listagem se existir
        await redis.del("users:all");
      } catch (error) {
        console.error("Erro ao limpar cache Redis:", error);
      }
    }

    return userPublic;
  }

  /**
   * Verifica senha
   */
  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Retorna todos os usuários (sem senha)
   */
  static async getAll(): Promise<UserPublic[]> {
    const redis = getRedisClient();
    const cacheKey = "users:all";

    // Tenta buscar do cache primeiro
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error("Erro ao buscar do cache Redis:", error);
      }
    }

    // Busca do MongoDB
    const users = await MongooseUserModel.find({}, { password: 0 }).lean();

    const usersPublic: UserPublic[] = users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));

    // Salva no cache
    if (redis) {
      try {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(usersPublic));
      } catch (error) {
        console.error("Erro ao salvar no cache Redis:", error);
      }
    }

    return usersPublic;
  }

  /**
   * Invalida cache de um usuário específico
   */
  static async invalidateCache(
    userId: string,
    email?: string,
    username?: string
  ): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
      const keys = [`user:id:${userId}`];
      if (email) keys.push(`user:email:${email}`);
      if (username) keys.push(`user:username:${username}`);
      keys.push("users:all"); // Invalida cache de listagem também

      await redis.del(...keys);
    } catch (error) {
      console.error("Erro ao invalidar cache Redis:", error);
    }
  }

  /**
   * Inicializa usuário admin padrão
   */
  static async initializeAdmin(): Promise<void> {
    const existingAdmin = await this.findByEmail("admin@example.com");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const adminUser = new MongooseUserModel({
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });
      await adminUser.save();
      console.log("✅ Usuário admin inicializado");
    }
  }

  /**
   * Método auxiliar para testes - limpa todos os usuários
   */
  static async clearAll(): Promise<void> {
    await MongooseUserModel.deleteMany({});
    const redis = getRedisClient();
    if (redis) {
      try {
        const keys = await redis.keys("user:*");
        const allKeys = await redis.keys("users:*");
        if (keys.length > 0 || allKeys.length > 0) {
          await redis.del(...keys, ...allKeys);
        }
      } catch (error) {
        console.error("Erro ao limpar cache Redis:", error);
      }
    }
  }
}

export default UserModel;
