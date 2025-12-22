export interface ServiceConfig {
  baseUrl: string;
  timeout: number;
}

export interface ServicesConfig {
  unidades: ServiceConfig;
  pessoas: ServiceConfig;
  infraestrutura: ServiceConfig;
  localizacao: ServiceConfig;
}

export const services: ServicesConfig = {
  unidades: {
    baseUrl: process.env.UNIDADES_SERVICE_URL || 'http://localhost:3001',
    timeout: parseInt(process.env.UNIDADES_SERVICE_TIMEOUT || '5000', 10),
  },
  pessoas: {
    baseUrl: process.env.PESSOAS_SERVICE_URL || 'http://localhost:3002',
    timeout: parseInt(process.env.PESSOAS_SERVICE_TIMEOUT || '5000', 10),
  },
  infraestrutura: {
    baseUrl: process.env.INFRAESTRUTURA_SERVICE_URL || 'http://localhost:3003',
    timeout: parseInt(process.env.INFRAESTRUTURA_SERVICE_TIMEOUT || '5000', 10),
  },
  localizacao: {
    baseUrl: process.env.LOCALIZACAO_SERVICE_URL || 'http://localhost:3004',
    timeout: parseInt(process.env.LOCALIZACAO_SERVICE_TIMEOUT || '5000', 10),
  },
};

export const getServiceConfig = (serviceName: keyof ServicesConfig): ServiceConfig => {
  return services[serviceName];
};

