# Variáveis de Ambiente - Frontend

## Configuração Necessária

Crie um arquivo `.env.local` na raiz do projeto frontend com as seguintes variáveis:

```bash
# ============================================
# Configurações do Frontend - HabilitaDev
# ============================================

# URL pública do Backend (para chamadas client-side)
# Usado em componentes React que rodam no navegador
# Em desenvolvimento: http://localhost:8080
# Em produção: URL pública do backend Java (ex.: https://habilitadev-backendd.onrender.com)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# URL interna do Backend (para chamadas server-side)
# Usado em API routes do Next.js que rodam no servidor
# Em Docker: http://backend:8080 (nome do serviço)
# Localmente: http://localhost:8080
BACKEND_URL=http://localhost:8080

# URL do Serviço de IA (validação de respostas)
# Porta padrão: 5000 (Flask/Python)
# Em Docker: http://ai-service:5000
# Localmente: http://localhost:5000
AI_VALIDATION_URL=http://localhost:5000

# ============================================
# Configurações de Desenvolvimento
# ============================================

# Ambiente de execução
NODE_ENV=development

# Porta do Next.js
PORT=3001

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Nome da aplicação
NEXT_PUBLIC_APP_NAME=HabilitaDev
```

## Explicação das Variáveis

### NEXT_PUBLIC_BACKEND_URL
- **Uso**: Chamadas client-side (navegador → Next.js → Backend)
- **Desenvolvimento**: `http://localhost:8080`
- **Produção**: URL pública do backend (ex: `https://api.habilitadev.com`)
- **Importante**: Variáveis com prefixo `NEXT_PUBLIC_` são expostas ao cliente

### BACKEND_URL
- **Uso**: Chamadas server-side (Next.js Server → Backend)
- **Docker**: `http://backend:8080` (nome do serviço Docker)
- **Local**: `http://localhost:8080`
- **Importante**: Esta variável NÃO é exposta ao cliente

### AI_VALIDATION_URL
- **Uso**: Serviço de IA para validação de respostas
- **Porta padrão**: `5000` (Flask/Python)
- **Docker**: `http://ai-service:5000`
- **Local**: `http://localhost:5000`

## Configuração Docker

No `docker-compose.yml`, configure as variáveis de ambiente:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      # Para chamadas client-side (navegador → Next.js → Backend)
      - NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
      # Para chamadas server-side (Next.js Server → Backend)
      - BACKEND_URL=http://backend:8080
      - AI_VALIDATION_URL=http://ai-service:5000
    depends_on:
      - backend
      - ai-service
```

## Diferença entre NEXT_PUBLIC_ e Variáveis Normais

- **NEXT_PUBLIC_***: Expostas ao cliente (browser), podem ser acessadas em componentes React
- **Sem prefixo**: Apenas no servidor (API routes, Server Components)

## Exemplo de Uso

### Client-side (componente React)
```typescript
// ✅ Funciona - variável pública
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// ❌ Não funciona - variável não exposta
const backendUrl = process.env.BACKEND_URL;
```

### Server-side (API route)
```typescript
// ✅ Funciona - ambas disponíveis no servidor
const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
```

