import mongoose from 'mongoose';

let isConnected = false;

export const connectMongoDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('✅ MongoDB já está conectado');
    return;
  }

  const mongoUri = process.env.MONGO_DB_URL;

  if (!mongoUri) {
    throw new Error('MONGO_DB_URL não está configurado no arquivo .env');
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('✅ MongoDB conectado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar do MongoDB:', error);
    throw error;
  }
};

