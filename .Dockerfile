# Etapa 1: build (compila TypeScript → JavaScript)
FROM node:20-alpine AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas arquivos de dependências primeiro (cache de build)
COPY package*.json ./

# Instala todas as dependências (prod + dev) para conseguir rodar o build
RUN npm ci

# Copia o código-fonte TypeScript e configs
COPY tsconfig.json ./
COPY src ./src

# Compila para a pasta dist/
RUN npm run build

# Etapa 2: runtime (imagem final, apenas o necessário para rodar)
FROM node:20-alpine AS runner

WORKDIR /app

# Define ambiente de produção
ENV NODE_ENV=production

# Copia somente package.json e package-lock.json
COPY package*.json ./

# Instala apenas dependências de produção (sem devDependencies)
RUN npm ci --only=production

# Copia os arquivos compilados do estágio de build
COPY --from=builder /app/dist ./dist

# (Opcional) Se quiser embutir um .env, descomente a linha abaixo:
# COPY .env ./

# Expor a porta usada pelo servidor (ajuste se necessário)
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/server.js"]