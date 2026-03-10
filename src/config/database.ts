import mongoose from 'mongoose'
import { dbLogger } from './logger'

let isConnected = false

export const connectMongoDB = async (): Promise<void> => {
   if (isConnected) {
      dbLogger.info('MongoDB já está conectado')
      return
   }

   const mongoUri = process.env.MONGO_DB_URL

   if (!mongoUri) {
      dbLogger.error('MONGO_DB_URL não está configurado no arquivo .env')
      throw new Error('MONGO_DB_URL não está configurado no arquivo .env')
   }

   try {
      await mongoose.connect(mongoUri)
      isConnected = true
      dbLogger.info('MongoDB conectado com sucesso')
   } catch (error) {
      dbLogger.error({ error }, 'Erro ao conectar ao MongoDB')
      throw error
   }
}

export const disconnectMongoDB = async (): Promise<void> => {
   if (!isConnected) {
      return
   }

   try {
      await mongoose.disconnect()
      isConnected = false
      dbLogger.info('MongoDB desconectado')
   } catch (error) {
      dbLogger.error({ error }, 'Erro ao desconectar do MongoDB')
      throw error
   }
}
