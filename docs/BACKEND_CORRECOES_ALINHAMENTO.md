# Documentação: Correções de Alinhamento Backend-Frontend

Este documento descreve as correções necessárias no backend para garantir o alinhamento completo com o frontend.

## 1. Rota de Validação de Resposta

### ✅ Frontend Atualizado
O frontend foi atualizado para usar a nova rota:
- **Nova rota**: `/api/v1/validation/{question_id}/validate-answer`
- **Rota antiga (remover)**: `/api/v1/questions/{question_id}/verify-answer`

### Backend - Implementação Necessária

Criar um novo grupo de rotas `validation` no backend:

```go
// internal/routes/validation.go ou similar

func SetupValidationRoutes(router *gin.RouterGroup) {
    validation := router.Group("/validation")
    {
        validation.POST("/:id/validate-answer", handlers.ValidateAnswer)
    }
}
```

**Handler de Validação** (`internal/handlers/validation.go`):

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

    // Lógica de validação...
    // Retornar resposta no formato esperado pelo frontend
}
```

**Estrutura de Request**:

```go
type ValidateAnswerRequest struct {
    UserAnswer    string `json:"user_answer" binding:"required"`
    CorrectAnswer string `json:"correct_answer"`
    QuestionContext string `json:"question_context"`
}
```

**Estrutura de Response**:

```go
type ValidateAnswerResponse struct {
    IsCorrect      bool     `json:"is_correct"`
    Score          float64  `json:"score"`
    Feedback       string   `json:"feedback"`
    Details        []string `json:"details"`
    ValidationMethod string `json:"validation_method,omitempty"`
    AIConfidence   float64  `json:"ai_confidence,omitempty"`
}
```

---

## 2. Porta do Serviço de IA

### Configuração Necessária

No arquivo `internal/services/ai_service.go`, garantir que a porta padrão seja **5000**:

```go
func NewAIService() *AIService {
    aiServiceURL := os.Getenv("AI_SERVICE_URL")
    
    // Porta padrão alterada para 5000 (padrão Flask/Python)
    if aiServiceURL == "" {
        aiServiceURL = "http://localhost:5000"
    }
    
    return &AIService{
        baseURL: aiServiceURL,
        client:  &http.Client{Timeout: 30 * time.Second},
    }
}
```

### Docker Compose

No `docker-compose.yml` ou `docker-compose.go.yml`, garantir que o serviço de IA esteja na porta 5000:

```yaml
services:
  ai-service:
    build: ./ai-service
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
    # ... outras configurações
```

---

## 3. Normalização de Tags (Array de Strings)

### Problema
O backend pode estar retornando tags como array de objetos, mas o frontend espera array de strings simples.

### Solução - DTO para Question

Criar um DTO (Data Transfer Object) para normalizar a resposta:

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

// Função para converter Question (model) para QuestionDTO
func ToQuestionDTO(q *models.Question) *QuestionDTO {
    tags := make([]string, 0, len(q.Tags))
    for _, tag := range q.Tags {
        // Se Tag for um objeto, extrair apenas o nome
        if tagObj, ok := tag.(map[string]interface{}); ok {
            if name, exists := tagObj["name"]; exists {
                tags = append(tags, fmt.Sprintf("%v", name))
            }
        } else if tagStr, ok := tag.(string); ok {
            tags = append(tags, tagStr)
        }
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

// Para arrays de questões
func ToQuestionDTOList(questions []*models.Question) []*QuestionDTO {
    dtos := make([]*QuestionDTO, len(questions))
    for i, q := range questions {
        dtos[i] = ToQuestionDTO(q)
    }
    return dtos
}
```

### Uso nos Handlers

```go
// internal/handlers/questions.go

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

func GetQuestion(c *gin.Context) {
    id, _ := strconv.Atoi(c.Param("id"))
    question, err := questionService.GetByID(id)
    if err != nil {
        c.JSON(404, gin.H{"error": "Questão não encontrada"})
        return
    }
    
    // Converter para DTO
    dto := dto.ToQuestionDTO(question)
    c.JSON(200, dto)
}
```

### Alternativa: Custom JSON Marshal

Se preferir usar o modelo diretamente, implementar `MarshalJSON`:

```go
// internal/models/question.go

func (q *Question) MarshalJSON() ([]byte, error) {
    // Converter Tags para array de strings
    tags := make([]string, 0, len(q.Tags))
    for _, tag := range q.Tags {
        if tagObj, ok := tag.(map[string]interface{}); ok {
            if name, exists := tagObj["name"]; exists {
                tags = append(tags, fmt.Sprintf("%v", name))
            }
        } else if tagStr, ok := tag.(string); ok {
            tags = append(tags, tagStr)
        }
    }
    
    type Alias Question
    return json.Marshal(&struct {
        Tags []string `json:"tags"`
        *Alias
    }{
        Tags:  tags,
        Alias: (*Alias)(q),
    })
}
```

---

## 4. Payload de Resposta (Answer)

### Estrutura Esperada pelo Frontend

O frontend envia os seguintes campos:

```json
{
  "author_name": "Nome do Autor",
  "content": "Conteúdo da resposta",
  "is_solution": false
}
```

### Backend - Struct de Binding

Garantir que a struct de entrada tenha as tags JSON corretas:

```go
// internal/handlers/answers.go

type CreateAnswerRequest struct {
    AuthorName string `json:"author_name" binding:"required"` // Essencial: snake_case
    Content    string `json:"content" binding:"required"`
    IsSolution bool   `json:"is_solution"` // snake_case
}

func CreateAnswerPublic(c *gin.Context) {
    questionID, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(400, gin.H{"error": "ID da questão inválido"})
        return
    }

    var req CreateAnswerRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{
            "error": "Dados inválidos",
            "details": err.Error(),
        })
        return
    }

    // Validar campos obrigatórios
    if req.AuthorName == "" {
        c.JSON(400, gin.H{"error": "author_name é obrigatório"})
        return
    }

    if req.Content == "" {
        c.JSON(400, gin.H{"error": "content é obrigatório"})
        return
    }

    // Criar resposta
    answer := &models.Answer{
        QuestionID: questionID,
        AuthorName: req.AuthorName,
        Content:    req.Content,
        IsSolution: req.IsSolution,
        CreatedAt:  time.Now(),
    }

    // Salvar no banco
    if err := answerService.Create(answer); err != nil {
        c.JSON(500, gin.H{"error": "Erro ao criar resposta"})
        return
    }

    // Retornar resposta criada
    c.JSON(201, answer)
}
```

### Estrutura de Resposta (Answer)

O frontend espera receber:

```json
{
  "id": 1,
  "question_id": 123,
  "author_name": "Nome do Autor",
  "content": "Conteúdo da resposta",
  "created_at": "2024-01-15T10:00:00Z",
  "is_solution": false
}
```

Garantir que o modelo `Answer` tenha as tags JSON corretas:

```go
// internal/models/answer.go

type Answer struct {
    ID         int       `json:"id" gorm:"primaryKey"`
    QuestionID int       `json:"question_id" gorm:"not null"`
    AuthorName string    `json:"author_name" gorm:"not null"` // snake_case
    Content    string    `json:"content" gorm:"type:text;not null"`
    IsSolution bool      `json:"is_solution" gorm:"default:false"` // snake_case
    CreatedAt  time.Time `json:"created_at"`
}
```

---

## 5. Configuração Docker

### Docker Compose - Configuração Recomendada

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/habilitadev
      - AI_SERVICE_URL=http://ai-service:5000
    depends_on:
      - db
      - ai-service
    networks:
      - habilitadev-network

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      # Para chamadas client-side (navegador → Next.js → Backend)
      - NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
      # Para chamadas server-side (Next.js Server → Backend)
      - BACKEND_URL=http://backend:8080
    depends_on:
      - backend
    networks:
      - habilitadev-network

  ai-service:
    build: ./ai-service
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
    networks:
      - habilitadev-network

  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=habilitadev
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - habilitadev-network

networks:
  habilitadev-network:
    driver: bridge

volumes:
  postgres_data:
```

### Variáveis de Ambiente - Frontend

Criar arquivo `.env.local` no frontend:

```bash
# URL pública para chamadas client-side (navegador → Next.js → Backend)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# URL interna para chamadas server-side (Next.js Server → Backend)
# No Docker, usar: http://backend:8080
# Localmente, usar: http://localhost:8080
BACKEND_URL=http://localhost:8080

# URL do serviço de IA
AI_VALIDATION_URL=http://localhost:5000
```

### Explicação das URLs

1. **NEXT_PUBLIC_BACKEND_URL**: 
   - Usado em código client-side (componentes React)
   - Deve ser acessível pelo navegador do usuário
   - Em desenvolvimento: `http://localhost:8080`
   - Em produção: URL pública do backend

2. **BACKEND_URL**:
   - Usado em código server-side (API routes do Next.js)
   - No Docker: usar nome do serviço (`http://backend:8080`)
   - Localmente: usar `http://localhost:8080`

---

## Resumo das Correções

| Item | Status Frontend | Status Backend | Prioridade |
|------|----------------|----------------|------------|
| Rota de validação | ✅ Atualizado | ⚠️ Implementar | Alta |
| Porta IA (5000) | ✅ Configurado | ⚠️ Verificar | Média |
| Tags (array strings) | ✅ Esperado | ⚠️ Normalizar | Alta |
| Payload Answer | ✅ Enviando | ⚠️ Verificar binding | Alta |
| Docker config | ✅ Documentado | ⚠️ Aplicar | Média |

---

## Testes Recomendados

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

### 2. Teste de Criação de Resposta
```bash
curl -X POST http://localhost:8080/api/v1/questions/123/answers \
  -H "Content-Type: application/json" \
  -d '{
    "author_name": "João Silva",
    "content": "Esta é minha resposta",
    "is_solution": false
  }'
```

### 3. Teste de Listagem de Questões (verificar tags)
```bash
curl http://localhost:8080/api/v1/questions
# Verificar se tags é array de strings: ["tag1", "tag2"]
# Não deve ser array de objetos: [{"id": 1, "name": "tag1"}]
```

---

## Próximos Passos

1. ✅ Frontend atualizado com nova rota de validação
2. ⚠️ Backend: Implementar rota `/api/v1/validation/{id}/validate-answer`
3. ⚠️ Backend: Normalizar tags para array de strings
4. ⚠️ Backend: Verificar binding de `CreateAnswerRequest`
5. ⚠️ Backend: Configurar porta 5000 para serviço de IA
6. ⚠️ Docker: Aplicar configurações de rede e variáveis de ambiente

