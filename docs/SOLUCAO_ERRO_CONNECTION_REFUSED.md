# Solução: Erro ERR_CONNECTION_REFUSED

## 🔍 Problema

O frontend está retornando erro `ERR_CONNECTION_REFUSED` ao tentar acessar o backend:

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

## 🎯 Causa Principal

O backend não está rodando ou não está acessível na URL configurada.

## ✅ Soluções

### 1. Verificar se o Backend está Rodando

**No diretório do backend:**

```bash
# Verificar se há um processo rodando na porta 8080
# Windows PowerShell:
netstat -an | findstr :8080

# Linux/Mac:
lsof -i :8080
# ou
netstat -an | grep :8080
```

**Se não houver processo rodando, inicie o backend:**

```bash
# No diretório do backend
go run main.go

# Ou se tiver um binário compilado
go build -o habilitadev-api . && ./habilitadev-api
```

**Verificar se o backend está respondendo:**

```bash
# Testar health check
curl http://localhost:8080/health

# Deve retornar algo como:
# {"status":"healthy","service":"habilitadev-backend","version":"2.0.0"}
```

---

### 2. Verificar Variáveis de Ambiente

**Criar/verificar arquivo `.env.local` na raiz do frontend:**

```bash
# URL pública do Backend (para chamadas client-side)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# URL interna do Backend (para chamadas server-side)
BACKEND_URL=http://localhost:8080
```

**Importante:** Reinicie o Next.js após criar/alterar o arquivo `.env.local`:

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

### 3. Verificar Porta do Backend

O backend pode estar rodando em outra porta. Verifique:

**No código do backend:**
- Arquivo `main.go` ou similar
- Procure por `:8080` ou variável `PORT`
- Verifique se está usando a porta correta

**Testar diferentes portas:**

```bash
# Testar porta 8080
curl http://localhost:8080/health

# Testar porta 3000
curl http://localhost:3000/health

# Testar porta 5000
curl http://localhost:5000/health
```

---

### 4. Verificar Firewall/Antivírus

Alguns firewalls ou antivírus bloqueiam conexões locais entre portas.

**Solução:**
- Adicionar exceção no firewall para a porta 8080
- Verificar se o antivírus não está bloqueando conexões locais
- Desabilitar temporariamente o firewall para testar

---

### 5. Verificar se há Outro Processo Usando a Porta

**Windows PowerShell:**
```powershell
# Ver processos usando a porta 8080
netstat -ano | findstr :8080

# Matar processo (substitua PID pelo número do processo)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Ver processos usando a porta 8080
lsof -i :8080

# Matar processo (substitua PID pelo número do processo)
kill -9 <PID>
```

---

## 🔧 Diagnóstico Passo a Passo

### Passo 1: Verificar Backend

```bash
# Testar se o backend responde
curl http://localhost:8080/health
```

**Se não responder:**
- Backend não está rodando → Inicie o backend
- Backend está em outra porta → Atualize `.env.local`
- Firewall bloqueando → Configure exceção

---

### Passo 2: Verificar Configuração do Frontend

**Verificar se a variável está configurada:**

```bash
# No terminal do Next.js, verificar logs
# Deve mostrar: 🔍 Backend URL configurada: http://localhost:8080
```

**Se não aparecer ou estiver vazia:**
- Crie/edite `.env.local` com `NEXT_PUBLIC_BACKEND_URL=http://localhost:8080`
- Reinicie o Next.js

---

### Passo 3: Verificar Logs

**Logs do Backend:**
- Deve mostrar: `[GIN-debug] Listening and serving HTTP on :8080`
- Deve mostrar requisições recebidas: `[GIN] GET /api/v1/questions`

**Logs do Frontend (Next.js):**
- Deve mostrar: `🌐 Fetching questions from backend: http://localhost:8080/api/v1/questions`
- Se mostrar erro: `❌ Erro ao conectar com backend`

---

## 📋 Checklist de Verificação

- [ ] Backend está rodando? (`curl http://localhost:8080/health`)
- [ ] Variável `NEXT_PUBLIC_BACKEND_URL` está configurada?
- [ ] Arquivo `.env.local` existe e está correto?
- [ ] Next.js foi reiniciado após criar/alterar `.env.local`?
- [ ] Backend está na porta 8080?
- [ ] Firewall não está bloqueando?
- [ ] Não há outro processo usando a porta 8080?
- [ ] Logs do backend mostram requisições chegando?

---

## 🚀 Solução Rápida

1. **Iniciar o backend:**
   ```bash
   cd backend
   go run main.go
   ```

2. **Verificar se está rodando:**
   ```bash
   curl http://localhost:8080/health
   ```

3. **Configurar variável de ambiente:**
   ```bash
   # Criar .env.local na raiz do frontend
   echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8080" > .env.local
   ```

4. **Reiniciar o Next.js:**
   ```bash
   # Parar (Ctrl+C) e iniciar novamente
   npm run dev
   ```

---

## 💡 Dicas

1. **Sempre reinicie o Next.js** após alterar variáveis de ambiente
2. **Verifique os logs** do backend para ver se as requisições estão chegando
3. **Teste com curl primeiro** para isolar o problema
4. **Verifique a porta** - pode estar diferente do esperado
5. **Firewall/Antivírus** podem bloquear conexões locais

---

## 🔍 Mensagens de Erro Melhoradas

Agora, quando ocorrer `ERR_CONNECTION_REFUSED`, você verá:

```json
{
  "error": "Service Unavailable",
  "message": "Não foi possível conectar ao backend em http://localhost:8080. O servidor pode não estar rodando. Verifique se o backend está iniciado na porta 8080.",
  "details": {
    "error": "ERR_CONNECTION_REFUSED",
    "errorName": "TypeError",
    "backendUrl": "http://localhost:8080",
    "attemptedUrl": "http://localhost:8080/api/v1/questions",
    "troubleshooting": [
      "Verifique se o backend está rodando: go run main.go",
      "Verifique se a porta 8080 está acessível: curl http://localhost:8080/health",
      "Verifique a variável NEXT_PUBLIC_BACKEND_URL no arquivo .env.local",
      "Se estiver usando Docker, verifique se os containers estão rodando: docker-compose ps"
    ]
  }
}
```

---

**Última atualização:** 2024-01-15

