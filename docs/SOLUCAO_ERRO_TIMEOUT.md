# Solução: Erro de Timeout nas Requisições

## 🔍 Problema Identificado

O sistema estava apresentando erros de timeout nas requisições:

```
❌ API request failed: AbortError: signal is aborted without reason
Erro ao enviar questão: Error: A requisição demorou muito para responder.
```

## 🎯 Causas Possíveis

1. **Backend offline ou não configurado**
   - O backend não está rodando
   - A variável `NEXT_PUBLIC_BACKEND_URL` não está configurada
   - O backend está rodando em uma porta diferente

2. **Timeout muito curto**
   - Operações de criação (POST) podem demorar mais que 30 segundos
   - Processamento no backend pode ser lento

3. **Problemas de rede**
   - Conexão lenta ou instável
   - Firewall bloqueando requisições
   - CORS não configurado corretamente

## ✅ Correções Aplicadas

### 1. Timeout Aumentado para Operações de Escrita

**Arquivo:** `lib/api.ts`

**Mudança:**
- Timeout padrão: 30 segundos (leitura)
- Timeout para POST/PUT/PATCH: 60 segundos (escrita)

```typescript
// Timeout maior para operações de criação (POST/PUT)
const isWriteOperation = options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH';
const timeoutDuration = isWriteOperation ? config.api.timeout * 2 : config.api.timeout; // 60s para escrita, 30s para leitura
```

### 2. Melhor Tratamento de Erros

**Arquivo:** `lib/api.ts`

**Melhorias:**
- Detecção específica de `AbortError`
- Mensagens de erro mais claras e informativas
- Logs detalhados em desenvolvimento

```typescript
// Melhor tratamento de erro de abort
if (fetchError instanceof Error && fetchError.name === 'AbortError') {
  const timeoutMessage = `A requisição demorou mais de ${timeoutDuration / 1000} segundos para responder.`;
  throw new Error(timeoutMessage + ' Verifique se o backend está rodando e tente novamente.');
}
```

### 3. Logs Melhorados no Proxy

**Arquivo:** `app/api/proxy/questions/route.ts`

**Melhorias:**
- Logs detalhados do timeout
- Informações sobre URL do backend
- Detecção de erros de rede

```typescript
console.error(`❌ Erro ao conectar com backend:`, {
  error: errorMessage,
  name: errorName,
  url: url,
  isTimeout: isTimeout,
  isNetworkError: isNetworkError,
  backendUrl: BACKEND_URL
});
```

## 🔧 Como Verificar e Resolver

### 1. Verificar se o Backend está Rodando

```bash
# Verificar se o backend está respondendo
curl http://localhost:8080/api/v1/health

# Ou verificar a porta
netstat -an | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac
```

### 2. Verificar Variáveis de Ambiente

Crie/verifique o arquivo `.env.local`:

```bash
# URL do backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:8080
```

### 3. Verificar Logs do Backend

Se o backend estiver rodando, verifique os logs para ver se a requisição está chegando:

```bash
# Logs do backend Go
# Deve mostrar a requisição POST /api/v1/questions
```

### 4. Testar a Conexão Manualmente

```bash
# Testar criação de questão diretamente
curl -X POST http://localhost:8080/api/v1/questions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste",
    "description": "Descrição teste",
    "answer": "Resposta teste",
    "difficulty": "easy",
    "category": "algorithms",
    "approved": false
  }'
```

## 📋 Checklist de Diagnóstico

- [ ] Backend está rodando na porta 8080?
- [ ] Variável `NEXT_PUBLIC_BACKEND_URL` está configurada?
- [ ] O endpoint `/api/v1/questions` existe no backend?
- [ ] Não há firewall bloqueando a conexão?
- [ ] O backend está processando requisições normalmente?
- [ ] Os logs do backend mostram alguma requisição chegando?

## 🚀 Soluções Aplicadas

### Frontend

1. ✅ Timeout aumentado para 60s em operações de escrita
2. ✅ Mensagens de erro mais claras
3. ✅ Logs detalhados em desenvolvimento
4. ✅ Detecção específica de erros de rede e timeout

### Próximos Passos (Backend)

1. ⚠️ Verificar se o endpoint `/api/v1/questions` está implementado
2. ⚠️ Verificar se o backend está processando requisições corretamente
3. ⚠️ Verificar logs do backend para identificar gargalos
4. ⚠️ Considerar otimizar processamento se estiver muito lento

## 💡 Dicas

1. **Em desenvolvimento:** Os logs agora mostram mais informações sobre o erro
2. **Timeout:** Operações de criação agora têm 60 segundos (antes eram 30)
3. **Mensagens:** As mensagens de erro agora indicam claramente o problema
4. **Debug:** Verifique o console do navegador e os logs do Next.js para mais detalhes

## 📝 Exemplo de Erro Corrigido

**Antes:**
```
❌ API request failed: AbortError: signal is aborted without reason
Erro ao enviar questão: Error: A requisição demorou muito para responder.
```

**Depois:**
```
⏱️ Timeout atingido após 60000ms para POST http://localhost:8080/api/v1/questions
❌ Erro ao conectar com backend: {
  error: "signal is aborted without reason",
  name: "AbortError",
  url: "http://localhost:8080/api/v1/questions",
  isTimeout: true,
  backendUrl: "http://localhost:8080"
}
A requisição demorou mais de 60 segundos para responder. Verifique se o backend está rodando e tente novamente.
```

---

**Última atualização:** 2024-01-15

