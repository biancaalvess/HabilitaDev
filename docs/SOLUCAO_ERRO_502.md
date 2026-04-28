# Solução: Erro 502 Bad Gateway

## 🔍 Problema

O frontend está retornando erro **502 Bad Gateway** ao tentar acessar o backend via proxy:

```
api/proxy/questions:1 Failed to load resource: the server responded with a status of 502 (Bad Gateway)
```

## 🎯 Causas Principais

### 1. Backend não está rodando ⚠️ **MAIS COMUM**

O servidor Go não está rodando na porta 8080.

**Solução:**
```bash
# No diretório do backend
go run main.go

# Ou se tiver um binário compilado
go build -o habilitadev-api . && ./habilitadev-api
```

**Verificar se está rodando:**
```bash
# Windows PowerShell
netstat -an | findstr :8080

# Linux/Mac
lsof -i :8080
# ou
netstat -an | grep :8080
```

---

### 2. URL do backend incorreta

A variável de ambiente `NEXT_PUBLIC_BACKEND_URL` não está configurada ou está incorreta.

**Verificar:**
- Arquivo: `.env.local` na raiz do projeto frontend
- Deve conter: `NEXT_PUBLIC_BACKEND_URL=http://localhost:8080`

**Criar/editar `.env.local`:**
```bash
# URL pública do Backend (para chamadas client-side)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# URL interna do Backend (para chamadas server-side)
BACKEND_URL=http://localhost:8080
```

**Reiniciar o Next.js após alterar:**
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

### 3. Porta do backend diferente

O backend pode estar rodando em outra porta.

**Verificar:**
- Variável de ambiente `PORT` no backend
- Padrão: `8080`
- Verificar logs do backend ao iniciar (deve mostrar a porta)

**Exemplo de log do backend:**
```
[GIN-debug] Listening and serving HTTP on :8080
```

---

### 4. Problema de CORS

O backend pode estar bloqueando requisições do frontend.

**Verificar no backend:**
- Arquivo: `internal/middleware/middleware.go` ou similar
- Deve permitir origem: `http://localhost:3001` (ou a porta do frontend)

**Exemplo de configuração CORS no Go:**
```go
config := cors.DefaultConfig()
config.AllowOrigins = []string{"http://localhost:3001", "http://localhost:3000"}
config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
config.AllowHeaders = []string{"Content-Type", "Authorization"}
```

---

### 5. Firewall/Antivírus bloqueando

Alguns firewalls ou antivírus bloqueiam conexões locais entre portas.

**Solução:**
- Adicionar exceção no firewall para a porta 8080
- Verificar se o antivírus não está bloqueando conexões locais

---

## 🔧 Como Diagnosticar

### 1. Verificar se o backend está rodando

```bash
# Testar health check
curl http://localhost:8080/health

# Resposta esperada:
{
  "status": "healthy",
  "service": "habilitadev-backend",
  "version": "2.0.0"
}
```

**Se não responder:**
- Backend não está rodando
- Backend está em outra porta
- Firewall bloqueando

---

### 2. Verificar rota de questões

```bash
# Testar endpoint de questões
curl http://localhost:8080/api/v1/questions

# Resposta esperada: Array de questões (pode estar vazio [])
```

**Se retornar 404:**
- Endpoint não existe no backend
- Rota diferente no backend

**Se retornar 502:**
- Backend não está processando corretamente
- Verificar logs do backend

---

### 3. Verificar logs do backend

Os logs devem mostrar as requisições recebidas:

```
[GIN] 2024/01/15 - 10:30:00 | 200 |     50ms |      127.0.0.1 | GET      "/api/v1/questions"
```

**Se não aparecer nenhum log:**
- Requisição não está chegando ao backend
- Proxy não está encaminhando corretamente

---

### 4. Verificar configuração do proxy no Next.js

**Arquivo:** `app/api/proxy/questions/route.ts`

**Verificar:**
```typescript
const BACKEND_URL = config.api.backendUrl;
console.log('🔍 Backend URL configurada:', BACKEND_URL);
```

**Deve mostrar no console:**
```
🔍 Backend URL configurada: http://localhost:8080
```

**Se mostrar vazio ou undefined:**
- Variável de ambiente não está configurada
- Arquivo `.env.local` não existe ou está incorreto

---

### 5. Verificar variáveis de ambiente

**No terminal do Next.js, verificar:**
```bash
# Verificar se a variável está sendo lida
# Os logs devem mostrar a URL do backend
```

**Criar/verificar `.env.local`:**
```bash
# Na raiz do projeto frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:8080
```

**Importante:** Reiniciar o Next.js após criar/alterar `.env.local`

---

## ✅ Soluções Rápidas

### Solução 1: Reiniciar o backend

```bash
# 1. Parar o backend (Ctrl+C no terminal onde está rodando)

# 2. Verificar se a porta está livre
# Windows:
netstat -an | findstr :8080

# 3. Iniciar novamente
cd backend
go run main.go
```

---

### Solução 2: Verificar e configurar variáveis de ambiente

```bash
# 1. Criar arquivo .env.local na raiz do frontend
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8080" > .env.local
echo "BACKEND_URL=http://localhost:8080" >> .env.local

# 2. Reiniciar o Next.js
# Parar (Ctrl+C) e iniciar novamente
npm run dev
```

---

### Solução 3: Verificar porta do backend

```bash
# No backend, verificar qual porta está usando
# Geralmente está em main.go ou config.go

# Verificar variável PORT
# Windows PowerShell:
echo $env:PORT

# Linux/Mac:
echo $PORT

# Se não estiver definida, o padrão geralmente é 8080
```

---

### Solução 4: Testar conexão direta

```bash
# Testar se o backend responde diretamente
curl -v http://localhost:8080/health

# Se funcionar, o problema está no proxy do Next.js
# Se não funcionar, o problema está no backend
```

---

## 📋 Checklist de Diagnóstico

Use este checklist para identificar o problema:

- [ ] Backend está rodando? (`curl http://localhost:8080/health`)
- [ ] Variável `NEXT_PUBLIC_BACKEND_URL` está configurada?
- [ ] Arquivo `.env.local` existe e está correto?
- [ ] Next.js foi reiniciado após criar/alterar `.env.local`?
- [ ] Backend está na porta 8080?
- [ ] Firewall não está bloqueando?
- [ ] CORS está configurado no backend?
- [ ] Logs do backend mostram requisições chegando?

---

## 🚀 Endpoints Disponíveis no Backend

Verifique se estes endpoints existem e estão funcionando:

- ✅ `GET /health` - Health check
- ✅ `GET /api/v1/questions` - Listar questões
- ✅ `POST /api/v1/questions` - Criar questão
- ✅ `GET /api/v1/questions/pending` - Listar pendentes
- ✅ `GET /api/v1/questions/pending/:id` - Obter pendente

---

## 🔍 Logs Úteis

### Frontend (Next.js)
```
🌐 Fetching questions from backend: http://localhost:8080/api/v1/questions
🔍 Backend URL configurada: http://localhost:8080
```

### Backend (Go)
```
[GIN-debug] Listening and serving HTTP on :8080
[GIN] GET /api/v1/questions
```

### Se aparecer erro:
```
❌ Erro ao conectar com backend: {
  error: "Failed to fetch",
  name: "TypeError",
  url: "http://localhost:8080/api/v1/questions",
  backendUrl: "http://localhost:8080",
  isNetworkError: true
}
```

---

## 💡 Dicas Importantes

1. **Sempre reinicie o Next.js** após alterar variáveis de ambiente
2. **Verifique os logs** do backend para ver se as requisições estão chegando
3. **Teste com curl primeiro** para isolar o problema
4. **Verifique a porta** - pode estar diferente do esperado
5. **Firewall/Antivírus** podem bloquear conexões locais

---

## 📝 Exemplo de Erro Corrigido

**Antes (erro genérico):**
```
502 Bad Gateway
```

**Depois (erro detalhado):**
```json
{
  "error": "Bad Gateway",
  "message": "Não foi possível conectar ao backend em http://localhost:8080. Verifique se o servidor está rodando na porta 8080.",
  "details": {
    "error": "Failed to fetch",
    "errorName": "TypeError",
    "backendUrl": "http://localhost:8080",
    "attemptedUrl": "http://localhost:8080/api/v1/questions",
    "troubleshooting": [
      "Verifique se o backend está rodando: go run main.go",
      "Verifique se a porta 8080 está acessível: curl http://localhost:8080/health",
      "Verifique a variável NEXT_PUBLIC_BACKEND_URL no arquivo .env.local"
    ]
  }
}
```

---

## 🆘 Se o Problema Persistir

1. **Verifique os logs completos:**
   - Console do navegador (F12)
   - Terminal do Next.js
   - Terminal do backend

2. **Teste cada componente isoladamente:**
   - Backend direto: `curl http://localhost:8080/health`
   - Proxy do Next.js: `curl http://localhost:3001/api/proxy/questions`
   - Frontend: Abrir no navegador

3. **Verifique configurações de rede:**
   - Firewall
   - Antivírus
   - Proxy/VPN

4. **Considere usar Docker:**
   - Se estiver usando Docker, verifique se os serviços estão na mesma rede
   - Use `http://backend:8080` em vez de `http://localhost:8080`

---

**Última atualização:** 2024-01-15

