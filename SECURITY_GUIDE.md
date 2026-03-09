# Guia de Segurança - API Gateway

## Resumo das Melhorias Implementadas

### ✅ Correções de Segurança Concluídas

1. **Rota de Usuários Funcionando**
   - Corrigido conflito de rotas no `server.ts`
   - Rota `/api/v1/users` agora está disponível e protegida

2. **Rate Limiting (Limitação de Taxa)**
   - **Auth endpoints**: 5 tentativas por 15 minutos
   - **Geral**: 100 requisições por 15 minutos
   - Proteção contra ataques de força bruta e DoS

3. **Segurança de Headers (Helmet.js)**
   - CSP (Content Security Policy)
   - HSTS (HTTP Strict Transport Security)
   - Proteção contra XSS, clickjacking e outros ataques

4. **CORS Configurado**
   - Origens permitidas configuráveis via `.env`
   - Métodos e headers específicos
   - Credenciais habilitadas

5. **Validação de Senhas Fortes**
   - Mínimo de 8 caracteres
   - Letras maiúsculas e minúsculas
   - Números e caracteres especiais
   - Regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]`

6. **Mensagens de Erro Seguras**
   - Não revelam informações sensíveis
   - Mensagens genéricas para evitar vazamento de dados
   - Exemplo: "Credenciais inválidas" em vez de "Email não encontrado"

## Admin Credentials

**⚠️ ATENÇÃO: Altere estas credenciais em produção!**

- **Email**: `admin@example.com`
- **Password**: `admin123`

## Como Testar

### 1. Iniciar o Servidor

```bash
npm run dev
```

### 2. Executar Testes Automáticos

```bash
node test-auth.js
```

### 3. Testes Manuais

#### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

#### Acesso à Rota de Usuários

```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Registro de Novo Usuário

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "novousuario",
    "email": "novo@exemplo.com",
    "password": "Senha123@",
    "role": "user"
  }'
```

## Configurações de Segurança

### Environment Variables (`.env`)

```env
# Segurança JWT
JWT_SECRET=sua_chave_secreta_muito_forte_aqui
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://seusite.com

# URLs dos Microserviços
UNIDADES_SERVICE_URL=https://...
PESSOAS_SERVICE_URL=https://...
INFRAESTRUTURA_SERVICE_URL=https://...
LOCALIZACAO_SERVICE_URL=https://...
```

## Próximas Melhorias Recomendadas

### 🔴 Alta Prioridade

1. **Refresh Tokens**
   - Implementar sistema de refresh tokens
   - Tokens de acesso mais curtos (15min)
   - Refresh tokens armazenados no banco

2. **Blacklist de Tokens**
   - Sistema de logout que invalida tokens
   - Armazenar tokens revogados no Redis

3. **Auditoria e Logging**
   - Log de tentativas de login
   - Monitoramento de atividades suspeitas
   - Alertas de segurança

### 🟡 Média Prioridade

4. **2FA (Two-Factor Authentication)**
   - OTP via email ou aplicativo
   - Aumento significativo de segurança

5. **Validação de IP**
   - Restrição de acesso por IP
   - Geolocalização de login

6. **Criptografia de Dados Sensíveis**
   - Dados sensíveis no banco
   - Comunicação HTTPS obrigatória

### 🟢 Baixa Prioridade

7. **Monitoramento de Performance**
   - Métricas de tempo de resposta
   - Monitoramento de carga

8. **Documentação de Segurança**
   - Guia para desenvolvedores
   - Procedimentos de incidentes

## Comandos Úteis

### Verificar Status do Serviço

```bash
curl http://localhost:3000/health
```

### Verificar Documentação Swagger

```bash
# Acessar: http://localhost:3000/api/v1/docs
```

### Testar Rate Limiting

```bash
# Faça 6 requisições rapidamente para /auth/login
# A 6ª deve retornar erro 429
```

## Monitoramento

### Métricas de Segurança

- Taxa de login bem-sucedido vs falho
- Tentativas de acesso não autorizado
- Uso de endpoints sensíveis
- Tempo médio de resposta

### Alertas

- Múltiplas tentativas de login falhas
- Acesso a endpoints administrativos
- Erros de autenticação em lote
- Uso de tokens expirados

## Contatos de Segurança

Em caso de incidentes de segurança:

- Equipe de DevSecOps
- Administrador do sistema
- Documentação de procedimentos

---

**Última atualização**: 03/09/2026
**Versão**: 1.0.0
**Status**: Implementado ✅
