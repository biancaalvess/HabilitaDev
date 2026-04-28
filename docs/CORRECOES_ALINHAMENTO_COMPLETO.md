# Documentação Completa: Correções de Alinhamento Backend-Frontend

## 📋 Resumo Executivo

Este documento consolida todas as correções necessárias para alinhar o Frontend (Next.js) e o Backend (Go/Gin + Python) após análise unificada dos repositórios. As divergências identificadas impediriam o funcionamento correto do sistema.

---

## 🔍 Divergências Críticas Identificadas

### 1. Divergência Crítica de Rotas (Breaking Change)

**Problema:**
- Frontend chamava: `/api/v1/questions/{id}/verify-answer` (rota antiga/depreciada)
- Backend implementou: `/api/v1/validation/{id}/validate-answer` (rota nova)

**Status:** ✅ **CORRIGIDO no Frontend**

**Arquivo modificado:** `app/api/proxy/questions/[id]/validate-answer/route.ts`

---

### 2. Inconsistência de Portas (Serviço de IA)

**Problema:**
- Documentação: Porta 5000 (`AI_VALIDATION_URL=http://localhost:5000`)
- Backend (código): Porta 8001 (fallback padrão)

**Consequência:** Se o desenvolvedor seguir a documentação, o backend tentará conectar na porta 8001 enquanto o serviço Python estará na 5000, gerando erro de conexão.

**Status:** ⚠️ **REQUER CORREÇÃO NO BACKEND**

**Arquivo a modificar:** `internal/services/ai_service.go`

**Correção necessária:**
```go
// Alterar de:
if aiServiceURL == "" {
    aiServiceURL = "http://localhost:8001"
}

// Para:
if aiServiceURL == "" {
    aiServiceURL = "http://localhost:5000"  // Padrão Flask/Python
}
```

---

### 3. Contrato de Dados (Tags: String vs Objeto)

**Problema:**
- Frontend espera: `tags?: string[]` (array de strings)
- Backend retorna: `Tags []Tag` (array de objetos com `id` e `name`)

**Consequência:** O componente de UI no frontend quebrará ou exibirá `[object Object]` ao tentar renderizar as tags.

**Status:** ⚠️ **REQUER CORREÇÃO NO BACKEND**

**Solução:** Criar DTO (Data Transfer Object) para normalizar tags antes de retornar JSON.

**Arquivo a criar/modificar:** `internal/dto/question.go` ou `internal/handlers/questions.go`

---

### 4. Payload de Resposta (Answer)

**Problema:**
- Frontend envia: `author_name`, `content`, `is_solution` (snake_case)
- Backend pode não estar usando as tags JSON corretas no binding

**Status:** ✅ **VERIFICADO - Frontend está correto**

**Recomendação:** Verificar no backend se a struct `CreateAnswerRequest` possui as tags JSON corretas.

---

### 5. Complexidade Desnecessária: Fallback Duplo

**Problema:**
- Frontend tinha fallback: IA → Backend → Local
- Backend também tem fallback: IA → Validação Simples

**Consequência:** Lógica duplicada e confusa, difícil de manter.

**Status:** ✅ **CORRIGIDO no Frontend**

**Mudança:** Frontend agora apenas chama o backend. O backend é a única fonte da verdade e decide internamente se usa IA ou validação simples.

---

## ✅ Correções Aplicadas no Frontend

### 1. Rota de Validação Atualizada

**Arquivo:** `app/api/proxy/questions/[id]/validate-answer/route.ts`

**Mudança:**
- ❌ Removido: Tentativa direta de chamar serviço de IA
- ✅ Adicionado: Chamada única para backend na rota `/api/v1/validation/{id}/validate-answer`
- ✅ Simplificado: Backend é a única fonte da verdade

**Código:**
```typescript
// Apontando para a rota de validação dedicada no grupo 'validation'
// O backend gerencia internamente: tenta IA primeiro, se falhar usa validação simples
const url = `${BACKEND_URL}/api/v1/validation/${params.id}/validate-answer`;
```

---

### 2. Remoção de Fallback Duplo

**Arquivo:** `app/api/proxy/questions/[id]/validate-answer/route.ts`

**Mudança:**
- ❌ Removido: Lógica de tentar IA diretamente no frontend
- ❌ Removido: Variável `AI_VALIDATION_URL` (não mais necessária)
- ✅ Simplificado: Apenas uma chamada ao backend

**Benefícios:**
- Código mais simples e fácil de manter
- Backend centraliza toda a lógica de validação
- Menos pontos de falha

---

## ⚠️ Correções Necessárias no Backend

### 1. Porta do Serviço de IA

**Arquivo:** `internal/services/ai_service.go`

**Ação:**
```go
func NewAIService() *AIService {
    aiServiceURL := os.Getenv("AI_SERVICE_URL")
    
    // Porta padrão alterada para 5000 (padrão Flask/Python)
    if aiServiceURL == "" {
        aiServiceURL = "http://localhost:5000"  // Alterado de 8001 para 5000
    }
    
    return &AIService{
        baseURL: aiServiceURL,
        client:  &http.Client{Timeout: 30 * time.Second},
    }
}
```

---

### 2. Normalização de Tags

**Arquivo:** `internal/dto/question.go` (criar) ou `internal/handlers/questions.go` (modificar)

**Ação:** Criar DTO para converter `[]Tag` em `[]string`:

```go
// internal/dto/question.go

type QuestionDTO struct {
    ID          int      `json:"id"`
    Title       string   `json:"title"`
    Description string   `json:"description"`
    Answer      string   `json:"answer"`
    Difficulty  string   `json:"difficulty"`
    Category    string   `json:"category"`
    Company     *string  `json:"company,omitempty"`
    Tags        []string `json:"tags"` // Array de strings simples
    CreatedAt   string   `json:"created_at"`
    Approved    bool     `json:"approved"`
}

func ToQuestionDTO(q *models.Question) *QuestionDTO {
    tags := make([]string, 0, len(q.Tags))
    for _, tag := range q.Tags {
        tags = append(tags, tag.Name) // Extrair apenas o nome
    }
    
    return &QuestionDTO{
        ID:          q.ID,
        Title:       q.Title,
        Description: q.Description,
        Answer:      q.Answer,
        Difficulty:  q.Difficulty,
        Category:    q.Category,
        Company:     q.Company,
        Tags:        tags, // Array de strings normalizado
        CreatedAt:   q.CreatedAt.Format(time.RFC3339),
        Approved:    q.Approved,
    }
}
```

**Uso nos handlers:**
```go
func GetQuestions(c *gin.Context) {
    questions, err := questionService.GetAll()
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    // Converter para DTO antes de retornar
    dtos := dto.ToQuestionDTOList(questions)
    c.JSON(200, dtos)
}
```

---

### 3. Verificar Binding de Answer

**Arquivo:** `internal/handlers/answers.go`

**Verificar se a struct possui as tags JSON corretas:**

```go
type CreateAnswerRequest struct {
    AuthorName string `json:"author_name" binding:"required"` // snake_case
    Content    string `json:"content" binding:"required"`
    IsSolution bool   `json:"is_solution"` // snake_case
}
```

---

### 4. Implementar Rota de Validação

**Arquivo:** `internal/routes/validation.go` (criar) ou `internal/routes/routes.go` (modificar)

**Ação:** Criar grupo de rotas `validation`:

```go
func SetupValidationRoutes(router *gin.RouterGroup) {
    validation := router.Group("/validation")
    {
        validation.POST("/:id/validate-answer", handlers.ValidateAnswer)
    }
}
```

**Handler:** `internal/handlers/validation.go`

```go
func ValidateAnswer(c *gin.Context) {
    questionID, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(400, gin.H{"error": "ID da questão inválido"})
        return
    }

    var req ValidateAnswerRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Lógica de validação:
    // 1. Tentar usar IA (se disponível)
    // 2. Se falhar, usar validação simples
    // 3. Retornar resultado no formato esperado pelo frontend
    
    // ... implementação ...
}
```

---

## 📝 Configuração de Ambiente

### Frontend (.env.local)

```bash
# URL pública para chamadas client-side (navegador → Next.js → Backend)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# URL interna para chamadas server-side (Next.js Server → Backend)
# No Docker: http://backend:8080
# Localmente: http://localhost:8080
BACKEND_URL=http://localhost:8080
```

**Nota:** A variável `AI_VALIDATION_URL` foi removida do frontend, pois o backend gerencia isso internamente.

---

### Backend (Variáveis de Ambiente)

```bash
# URL do serviço de IA (porta 5000)
AI_SERVICE_URL=http://localhost:5000

# Em Docker:
AI_SERVICE_URL=http://ai-service:5000
```

---

## 🧪 Testes Recomendados

### 1. Teste de Validação de Resposta

```bash
curl -X POST http://localhost:8080/api/v1/validation/123/validate-answer \
  -H "Content-Type: application/json" \
  -d '{
    "user_answer": "Resposta do usuário",
    "correct_answer": "Resposta correta",
    "question_context": "Contexto da questão"
  }'
```

**Resultado esperado:**
```json
{
  "is_correct": true,
  "score": 85.5,
  "feedback": "Feedback da validação",
  "details": [],
  "validation_method": "ai" // ou "backend" se IA falhar
}
```

---

### 2. Teste de Listagem de Questões (verificar tags)

```bash
curl http://localhost:8080/api/v1/questions
```

**Resultado esperado:**
```json
[
  {
    "id": 1,
    "title": "Questão exemplo",
    "tags": ["algoritmos", "ordenacao"] // Array de strings
  }
]
```

**❌ Não deve retornar:**
```json
[
  {
    "id": 1,
    "title": "Questão exemplo",
    "tags": [{"id": 1, "name": "algoritmos"}] // Array de objetos
  }
]
```

---

### 3. Teste de Criação de Resposta

```bash
curl -X POST http://localhost:8080/api/v1/questions/123/answers \
  -H "Content-Type: application/json" \
  -d '{
    "author_name": "João Silva",
    "content": "Esta é minha resposta",
    "is_solution": false
  }'
```

---

## 📊 Status das Correções

| Item | Frontend | Backend | Prioridade |
|------|----------|---------|------------|
| Rota de validação | ✅ Corrigido | ⚠️ Implementar | 🔴 Alta |
| Porta IA (5000) | ✅ Documentado | ⚠️ Corrigir | 🟡 Média |
| Tags (array strings) | ✅ Esperado | ⚠️ Normalizar | 🔴 Alta |
| Payload Answer | ✅ Correto | ⚠️ Verificar | 🔴 Alta |
| Fallback duplo | ✅ Removido | ✅ Já existe | ✅ Completo |
| Docker config | ✅ Documentado | ⚠️ Aplicar | 🟡 Média |

---

## 🎯 Próximos Passos

### Frontend
- ✅ Todas as correções aplicadas
- ✅ Documentação atualizada

### Backend
1. ⚠️ Alterar porta padrão do serviço de IA para 5000
2. ⚠️ Implementar rota `/api/v1/validation/{id}/validate-answer`
3. ⚠️ Criar DTO para normalizar tags (array de strings)
4. ⚠️ Verificar binding de `CreateAnswerRequest`
5. ⚠️ Aplicar configurações Docker

---

## 📚 Documentação Relacionada

- [Variáveis de Ambiente](./VARIAVEIS_AMBIENTE.md)
- [Correções de Alinhamento Backend](./BACKEND_CORRECOES_ALINHAMENTO.md)
- [Solicitação de Correção/Exclusão](./BACKEND_SOLICITACAO_CORRECAO.md)

---

## ⚠️ Observações Importantes

1. **Backend como Fonte da Verdade**: O frontend não deve mais tentar validar respostas localmente. Todo o processamento é feito pelo backend.

2. **Porta Padrão**: A porta 5000 foi escolhida por ser o padrão do Flask/Python, facilitando a integração com o serviço de IA.

3. **Tags Normalizadas**: É essencial que o backend retorne tags como array de strings, não como array de objetos, para evitar erros no frontend.

4. **Validação Centralizada**: Toda a lógica de validação (IA ou simples) deve estar no backend, facilitando manutenção e testes.

---

**Última atualização:** 2024-01-15

