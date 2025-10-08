# 🤖 Instruções de Configuração da IA - HabilitaDev

## ✅ **FASE 1: CORREÇÕES CRÍTICAS - CONCLUÍDAS**

Todas as correções críticas foram aplicadas com sucesso! Veja abaixo o que foi implementado e o que você precisa fazer para ativar a IA.

---

## 📝 **O QUE FOI CORRIGIDO**

### **1. ✅ Componente AnswerValidation Atualizado**
**Arquivo:** `components/answers/answer-validation.tsx`

**Mudanças:**
- ✅ Adicionado prop `questionId` (obrigatório)
- ✅ Adicionado prop `questionContext` (opcional)
- ✅ ID dinâmico na URL (não mais hardcoded como `1`)
- ✅ Timeout de 30 segundos nas requisições
- ✅ Contexto da questão passado para a IA

```typescript
// ANTES (❌ Problema)
const response = await fetch(`/api/proxy/questions/1/validate-answer`, {

// DEPOIS (✅ Corrigido)
const response = await fetch(`/api/proxy/questions/${questionId}/validate-answer`, {
  signal: AbortSignal.timeout(30000), // Timeout de 30s
```

---

### **2. ✅ Componente InlineAnswerForm Atualizado**
**Arquivo:** `components/answers/inline-answer-form.tsx`

**Mudanças:**
- ✅ Adicionado prop `questionContext` (opcional)
- ✅ Passa `questionId` para o componente `AnswerValidation`
- ✅ Passa contexto da questão para validação mais precisa

```typescript
// AGORA PASSA O QUESTION ID CORRETAMENTE
<AnswerValidation
  questionId={questionId}
  userAnswer={userAnswer}
  correctAnswer={correctAnswer}
  questionContext={questionContext}
  onValidationComplete={handleValidationComplete}
/>
```

---

### **3. ✅ URLs Padronizadas em Todos os Arquivos de API**

**Arquivos Atualizados:**
- ✅ `app/api/proxy/questions/route.ts`
- ✅ `app/api/proxy/questions/[id]/route.ts`
- ✅ `app/api/proxy/questions/[id]/feedback/route.ts`
- ✅ `app/api/proxy/questions/[id]/validate-answer/route.ts`

**Mudanças:**
```typescript
// ANTES (❌ Inconsistente)
const BACKEND_URL = 'https://habilitadev-backend.onrender.com'; // Hardcoded

// DEPOIS (✅ Padronizado)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://habilitadev-backend.onrender.com';
```

---

### **4. ✅ Timeout Adicionado em Todas as Requisições HTTP**

**Mudanças:**
- ✅ Timeout de 30 segundos em todas as requisições
- ✅ Previne travamentos por requisições indefinidas
- ✅ Melhora experiência do usuário

```typescript
// TODAS AS REQUISIÇÕES AGORA TÊM TIMEOUT
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  signal: AbortSignal.timeout(30000), // ✅ Timeout de 30 segundos
})
```

---

## 🔧 **O QUE VOCÊ PRECISA FAZER AGORA**

### **PASSO 1: Criar o Arquivo .env.local**

Na raiz do projeto, crie um arquivo chamado `.env.local` e adicione as seguintes variáveis:

```env
# ===========================================
# HabilitaDev - Frontend Environment Variables
# ===========================================

# ============ API Configuration ============
# Backend API URL (Production)
NEXT_PUBLIC_API_URL=https://habilitadev-backend.onrender.com

# AI Validation Service URL
# ⚠️ IMPORTANTE: Configure aqui a URL do seu serviço de IA
# Para desenvolvimento local: http://localhost:5000
# Para produção: URL do serviço de IA hospedado (Railway, Render, etc.)
AI_VALIDATION_URL=http://localhost:5000

# ============ Analytics ============
NEXT_PUBLIC_VERCEL_ANALYTICS=true

# ============ Development Settings ============
ENVIRONMENT=development
DEBUG=true

# ============ AI Services ============
# Configurações do modelo de IA
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.3

# ============ Request Timeout ============
# Timeout para requisições em milissegundos
REQUEST_TIMEOUT=30000

# ============ Feature Flags ============
# Habilitar validação por IA
ENABLE_AI_VALIDATION=true

# Habilitar fallback local quando IA estiver indisponível
ENABLE_LOCAL_FALLBACK=true

# ============ CORS ============
# Origens permitidas (para desenvolvimento)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

### **PASSO 2: Configurar o Serviço de IA**

A rota `/api/proxy/questions/[id]/validate-answer` espera um serviço de IA rodando que responda ao endpoint:

**Endpoint Esperado:**
```
POST http://localhost:5000/validate
```

**Estrutura da Requisição Esperada:**
```json
{
  "user_answer": "string - resposta do usuário",
  "question_id": "string - ID da questão",
  "correct_answer": "string - resposta correta",
  "question_context": "string - contexto da questão"
}
```

**Estrutura da Resposta Esperada:**
```json
{
  "is_correct": true,
  "score": 85,
  "confidence": 0.9,
  "feedback": "Resposta correta! Você demonstrou...",
  "details": [
    "✅ Algoritmo correto identificado",
    "✅ Complexidade mencionada corretamente",
    "⚠️ Pode melhorar a explicação..."
  ]
}
```

---

### **PASSO 3: Sistema de Fallback**

A aplicação tem **3 níveis de fallback** automáticos:

#### **Nível 1: IA (Prioritário)**
```
Tenta usar o serviço de IA configurado em AI_VALIDATION_URL
↓
Se funcionar: Retorna validação da IA
```

#### **Nível 2: Backend Tradicional**
```
Se IA falhar: Tenta usar o backend tradicional
↓
Se funcionar: Retorna validação do backend
```

#### **Nível 3: Validação Local (Fallback de Emergência)**
```
Se ambos falharem: Usa validação local no Next.js
↓
Sempre funciona: Retorna validação básica
```

**⚠️ IMPORTANTE:** A validação local atual está otimizada para questões sobre algoritmos. Para outras questões, você precisará generalizar a função `validateAnswerLocally()`.

---

## 🚀 **TESTANDO A IA**

### **Teste 1: Verificar se o Frontend está Carregando**

```bash
npm run dev
```

Acesse: `http://localhost:3001`

### **Teste 2: Verificar se a Variável de Ambiente foi Carregada**

Adicione temporariamente no arquivo `app/api/proxy/questions/[id]/validate-answer/route.ts`:

```typescript
console.log('AI_VALIDATION_URL:', AI_VALIDATION_URL);
console.log('BACKEND_URL:', BACKEND_URL);
```

Abra o console do servidor Next.js e verifique se as URLs estão corretas.

### **Teste 3: Testar Validação com IA**

1. Acesse uma questão
2. Preencha uma resposta
3. Envie
4. Verifique o console do navegador (F12) e do servidor

**Console do Navegador:**
```
[AnswerValidation] Enviando para validação por IA/backend
[AnswerValidation] Resultado recebido: { success: true, data: {...} }
```

**Console do Servidor:**
```
[AI VALIDATION] Iniciando validação por IA para question 1
[AI VALIDATION] Enviando para IA: http://localhost:5000/validate
[AI VALIDATION] Resultado da IA: { is_correct: true, score: 85, ... }
```

---

## 📊 **FLUXO COMPLETO DA VALIDAÇÃO**

```
┌─────────────────────────────────────────────────────────────┐
│  USUÁRIO ENVIA RESPOSTA                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  InlineAnswerForm                                           │
│  - Captura resposta do usuário                             │
│  - Chama AnswerValidation com questionId                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  AnswerValidation Component                                 │
│  - Faz POST para /api/proxy/questions/{id}/validate-answer │
│  - Timeout: 30 segundos                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  API Route: validate-answer/route.ts                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  NÍVEL 1: Tenta IA (AI_VALIDATION_URL)             │   │
│  │  POST http://localhost:5000/validate               │   │
│  │  ✅ Se sucesso → Retorna validação da IA           │   │
│  │  ❌ Se falhar → Próximo nível                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  NÍVEL 2: Tenta Backend Tradicional               │   │
│  │  POST {BACKEND_URL}/validate-answer                │   │
│  │  ✅ Se sucesso → Retorna validação do backend      │   │
│  │  ❌ Se falhar → Próximo nível                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  NÍVEL 3: Validação Local (Fallback)              │   │
│  │  Função validateAnswerLocally()                    │   │
│  │  ✅ Sempre funciona                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  RESULTADO EXIBIDO AO USUÁRIO                               │
│  - Score (0-100)                                            │
│  - Feedback detalhado                                       │
│  - Lista de pontos avaliados                                │
│  - Indicador de qual método foi usado                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 **TROUBLESHOOTING**

### **Problema 1: "IA não está respondendo"**

**Verificar:**
1. ✅ Arquivo `.env.local` existe e tem `AI_VALIDATION_URL`
2. ✅ Serviço de IA está rodando (teste com `curl` ou Postman)
3. ✅ URL da IA está correta (sem barra no final)
4. ✅ Reinicie o servidor Next.js após criar `.env.local`

**Teste Manual:**
```bash
curl -X POST http://localhost:5000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "user_answer": "teste",
    "question_id": "1",
    "correct_answer": "teste",
    "question_context": "teste"
  }'
```

---

### **Problema 2: "Sempre usa fallback local"**

**Verificar:**
1. Console do servidor mostra: `[AI VALIDATION] IA indisponível`
2. Verifique CORS no serviço de IA
3. Verifique se a IA retorna JSON válido
4. Verifique logs do serviço de IA

---

### **Problema 3: "Timeout toda vez"**

**Soluções:**
1. Aumentar timeout em `validate-answer/route.ts`:
   ```typescript
   signal: AbortSignal.timeout(60000), // 60 segundos
   ```
2. Otimizar serviço de IA
3. Verificar latência de rede

---

## 📈 **PRÓXIMOS PASSOS (FASE 2 - OPCIONAL)**

Após confirmar que a IA está funcionando, considere:

1. **Sistema de Retry:**
   - Tentar 3x antes de usar fallback
   - Delay exponencial entre tentativas

2. **Cache de Validações:**
   - Evitar revalidar mesma resposta
   - Redis ou cache em memória

3. **Monitoramento:**
   - Logs estruturados
   - Métricas de performance
   - Taxa de sucesso/falha

4. **Validação Local Genérica:**
   - Suportar qualquer tipo de questão
   - IA local leve para fallback

---

## ✅ **CHECKLIST FINAL**

Antes de testar em produção:

- [ ] Arquivo `.env.local` criado com todas as variáveis
- [ ] Serviço de IA rodando e respondendo
- [ ] Backend configurado (se usar)
- [ ] Variáveis de ambiente configuradas no Vercel/Netlify
- [ ] Testado localmente com sucesso
- [ ] Console sem erros
- [ ] Fallbacks funcionando
- [ ] Timeout adequado para sua rede

---

## 📞 **SUPORTE**

Se encontrar problemas:

1. Verifique os logs do console (navegador e servidor)
2. Teste cada endpoint manualmente
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Reinicie o servidor após mudanças no `.env.local`

---

## 🎉 **CONCLUSÃO**

Todas as correções críticas foram aplicadas! A IA está pronta para funcionar assim que você:

1. ✅ Criar o arquivo `.env.local`
2. ✅ Configurar a URL do serviço de IA
3. ✅ Reiniciar o servidor Next.js

**A aplicação agora suporta:**
- ✅ Validação por IA (prioritária)
- ✅ Validação por backend (fallback 1)
- ✅ Validação local (fallback 2)
- ✅ Timeout em todas as requisições
- ✅ IDs dinâmicos de questões
- ✅ URLs padronizadas e configuráveis

---

**Desenvolvido com dedicação para o HabilitaDev**

*Data: $(date)*
*Versão: 1.0.0*

