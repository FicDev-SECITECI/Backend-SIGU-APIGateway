# AGENTS.md

## Projeto

API Gateway em Node.js + TypeScript (Express) responsável por autenticação de usuários,
rate limiting, proxy de rotas e documentação via Swagger. Persiste dados no MongoDB via
Mongoose e usa Redis (ioredis) para cache e controle de sessão.

---

## Ambiente

- **Runtime:** Node >= 20
- **Package manager:** npm
- **Linguagem:** TypeScript 5.3 — `strict: true` obrigatório
- **Entrypoint de dev:** `src/server.ts` → compila para `dist/server.js`

Variáveis de ambiente obrigatórias: copie `.env.example` para `.env` antes de rodar.
Nunca commite `.env`.

---

## Comandos

### Desenvolvimento

```bash
npm run dev          # ts-node-dev com hot-reload (porta padrão: 3000)
```

### Build

```bash
npm run build        # tsc → dist/
npm start            # node dist/server.js (produção)
```

### Testes

```bash
npm test                          # jest (suite completa)
npm run test:watch                # modo watch
npm run test:coverage             # cobertura em coverage/lcov-report/index.html

# rodar um arquivo isolado:
npx jest src/path/to/file.test.ts --no-coverage

# rodar um teste específico por nome:
npx jest -t "nome do describe/it" --no-coverage
```

### Type-check sem build

```bash
npx tsc --noEmit
```

### Lint (se configurado)

```bash
npx eslint src/ --ext .ts
```

---

## Arquitetura & convenções

### Estrutura de `src/`

```
src/
├── server.ts                        # entrypoint: Express bootstrap + listen
├── config/
│   ├── database.ts                  # conexão Mongoose
│   ├── redis.ts                     # cliente ioredis singleton
│   ├── services.ts                  # configuração de serviços externos
│   └── swagger.ts                   # setup Swagger/OpenAPI
├── controllers/
│   ├── authController.ts            # registro, login, refresh, logout
│   └── protectedController.ts       # rotas que exigem JWT válido
├── middleware/
│   ├── auth.ts                      # verificação de JWT + injeção de req.user
│   └── proxyMiddleware.ts           # proxy reverso para serviços downstream
├── models/
│   ├── User.ts                      # interface/tipo do domínio User
│   └── UserSchema.ts                # schema Mongoose + índices
├── routes/
│   ├── auth.ts                      # POST /auth/register, /auth/login, etc.
│   └── protected.ts                 # rotas que passam pelo middleware auth
├── types/
│   └── index.ts                     # interfaces globais (JwtPayload, ApiError…)
└── views/                           # templates server-side (se aplicável)
```

Testes ficam em `__tests__/` dentro de cada módulo (padrão já adotado no projeto).

### Padrões obrigatórios

- **Auth:** JWT via `jsonwebtoken`. Tokens assinados com `ACCESS_TOKEN_SECRET` (env).
  Refresh tokens armazenados no Redis com TTL.
- **Hashing:** `bcryptjs` com salt rounds >= 10. Nunca armazene senha em plaintext.
- **Rate limiting:** `express-rate-limit` configurado por rota, não globalmente.
- **Validação:** sempre use `express-validator` + middleware de `validationResult` antes
  do controller. Nunca valide manualmente no controller.
- **Erros:** retorne sempre `{ error: string, code?: string }` com status HTTP correto.
  Use um middleware de erro centralizado (`middlewares/error.middleware.ts`).
- **Redis:** use `ioredis` (não o pacote `redis` direto). Cliente singleton em
  `config/redis.ts`.
- **Mongoose:** defina índices no próprio schema. Use `lean()` em queries read-only.
- **Swagger:** documente novas rotas com JSDoc `@swagger` inline no arquivo de rota.

### O que evitar

- `any` no TypeScript — use `unknown` + type guard se necessário
- `console.log` em produção — use um logger estruturado (winston ou pino)
- Lógica de negócio no controller
- Conexões diretas ao MongoDB/Redis fora dos módulos de `config/`

---

## Testes

- Framework: **Jest** + **supertest** para testes de integração de rotas
- Arquivos: `*.test.ts` colocados junto ao módulo testado **ou** em `__tests__/`
- Mocks: use `jest.mock()` para isolar Mongoose e ioredis nos unit tests
- Cada rota nova deve ter ao menos: teste de happy path + validação de input inválido +
  autenticação negada (401)

---

## Permissões do agente

### ✅ Pode fazer sem perguntar

- Ler, buscar e listar qualquer arquivo do projeto
- Rodar `npx tsc --noEmit`
- Rodar testes unitários isolados (`npx jest arquivo.test.ts --no-coverage`)
- Rodar `npm run build`
- Criar e editar arquivos em `src/`

### ⚠️ Perguntar antes

- `npm install` / adicionar dependências ao `package.json`
- Alterar `src/config/` (impacto em conexões de infra)
- Rodar `npm test` (suite completa — pode ser lento)
- Deletar arquivos existentes
- Alterar variáveis esperadas no `.env.example`

### 🚫 Nunca fazer

- **Ler, criar, editar ou deletar `.env`** — sem exceção, mesmo que solicitado
- Commitar secrets, tokens ou credenciais
- Modificar `dist/` diretamente
- Fazer `git push` sem instrução explícita
- Alterar `package-lock.json` manualmente

> **Regra absoluta sobre `.env`:** este arquivo existe na raiz do projeto e contém
> credenciais reais de produção/desenvolvimento. O agente **nunca** deve abrir,
> ler, modificar ou referenciar o conteúdo deste arquivo. Para saber quais variáveis
> o projeto usa, consulte `.env.example` ou `README.md`.
