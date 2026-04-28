# Documentação: Implementação de Solicitação de Correção/Exclusão no Backend

## Visão Geral

Este documento descreve as especificações para implementar o sistema de solicitação de correção ou exclusão de questões no backend. A funcionalidade permite que usuários solicitem correções de erros ou exclusão de questões inadequadas, fornecendo uma justificativa obrigatória.

## Endpoint Existente

O frontend utiliza o endpoint de feedback existente:
- **POST** `/api/v1/questions/{question_id}/feedback`

## Modificações Necessárias

### 1. Atualizar Modelo de Feedback

O tipo `feedback_type` deve aceitar o novo valor `"deletion"`:

```go
type FeedbackType string

const (
    FeedbackTypeCorrection FeedbackType = "correction"
    FeedbackTypeSuggestion FeedbackType = "suggestion"
    FeedbackTypeImprovement FeedbackType = "improvement"
    FeedbackTypeDeletion    FeedbackType = "deletion"  // NOVO
)
```

### 2. Estrutura de Dados

#### Request Body (POST `/api/v1/questions/{question_id}/feedback`)

```json
{
  "feedback_type": "correction" | "suggestion" | "improvement" | "deletion",
  "content": "string (mínimo 20 caracteres)",
  "status": "pending"
}
```

**Validações:**
- `feedback_type`: Obrigatório, deve ser um dos valores permitidos
- `content`: Obrigatório, mínimo de 20 caracteres
- `status`: Deve ser "pending" para novas solicitações

#### Response (Sucesso - 201 Created)

```json
{
  "id": 1,
  "question_id": 123,
  "user_id": null,
  "feedback_type": "deletion",
  "content": "[EXCLUSAO] Motivo detalhado da solicitação...",
  "status": "pending",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### 3. Banco de Dados

#### Tabela: `feedbacks`

Se a tabela ainda não existir, criar com a seguinte estrutura:

```sql
CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('correction', 'suggestion', 'improvement', 'deletion')),
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedbacks_question_id ON feedbacks(question_id);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_type ON feedbacks(feedback_type);
```

**Se a tabela já existir**, adicionar o novo tipo:

```sql
-- Verificar se a constraint existe e atualizar
ALTER TABLE feedbacks 
DROP CONSTRAINT IF EXISTS feedbacks_feedback_type_check;

ALTER TABLE feedbacks 
ADD CONSTRAINT feedbacks_feedback_type_check 
CHECK (feedback_type IN ('correction', 'suggestion', 'improvement', 'deletion'));
```

### 4. Validações no Backend

#### Validação de Conteúdo

```go
func ValidateFeedbackContent(content string) error {
    if len(strings.TrimSpace(content)) < 20 {
        return errors.New("o conteúdo deve ter no mínimo 20 caracteres")
    }
    if len(content) > 2000 {
        return errors.New("o conteúdo deve ter no máximo 2000 caracteres")
    }
    return nil
}
```

#### Validação de Tipo

```go
func ValidateFeedbackType(feedbackType string) error {
    validTypes := []string{"correction", "suggestion", "improvement", "deletion"}
    for _, validType := range validTypes {
        if feedbackType == validType {
            return nil
        }
    }
    return errors.New("tipo de feedback inválido")
}
```

### 5. Endpoint Handler (Exemplo em Go)

```go
func CreateFeedback(c *gin.Context) {
    questionID, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(400, gin.H{"error": "ID da questão inválido"})
        return
    }

    var feedback Feedback
    if err := c.ShouldBindJSON(&feedback); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Validações
    if err := ValidateFeedbackType(feedback.FeedbackType); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    if err := ValidateFeedbackContent(feedback.Content); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Verificar se a questão existe
    question, err := GetQuestionByID(questionID)
    if err != nil || question == nil {
        c.JSON(404, gin.H{"error": "Questão não encontrada"})
        return
    }

    // Criar feedback
    feedback.QuestionID = questionID
    feedback.Status = "pending"
    feedback.CreatedAt = time.Now()

    if err := db.Create(&feedback).Error; err != nil {
        c.JSON(500, gin.H{"error": "Erro ao criar feedback"})
        return
    }

    c.JSON(201, feedback)
}
```

### 6. Endpoint para Listar Solicitações (Admin)

Criar endpoint para administradores visualizarem todas as solicitações:

**GET** `/api/v1/admin/feedback`

**Query Parameters:**
- `status`: Filtrar por status (pending, reviewed, implemented)
- `type`: Filtrar por tipo (correction, suggestion, improvement, deletion)
- `question_id`: Filtrar por questão específica

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "question_id": 123,
      "question_title": "Título da questão",
      "feedback_type": "deletion",
      "content": "[EXCLUSAO] Motivo...",
      "status": "pending",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```

### 7. Endpoint para Atualizar Status (Admin)

**PATCH** `/api/v1/admin/feedback/{id}`

```json
{
  "status": "reviewed" | "implemented"
}
```

Permite que administradores atualizem o status das solicitações após análise.

### 8. Notificações (Opcional)

Considerar implementar notificações quando:
- Uma solicitação de exclusão é criada (notificar admins)
- Uma solicitação de correção é criada (notificar admins)
- Uma solicitação é resolvida (notificar o solicitante, se houver user_id)

## Fluxo de Dados

1. **Usuário preenche formulário** → Frontend valida campos
2. **Frontend envia POST** → `/api/v1/questions/{id}/feedback`
3. **Backend valida** → Tipo, conteúdo, questão existe
4. **Backend salva** → Cria registro na tabela `feedbacks`
5. **Backend retorna** → Feedback criado com status "pending"
6. **Admin visualiza** → Lista de solicitações pendentes
7. **Admin analisa** → Atualiza status para "reviewed" ou "implemented"

## Exemplo de Requisição

```bash
curl -X POST http://localhost:8080/api/v1/questions/123/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "feedback_type": "deletion",
    "content": "[EXCLUSAO] Esta questão contém informações incorretas sobre algoritmos de ordenação. A complexidade informada está errada e pode confundir os estudantes.",
    "status": "pending"
  }'
```

## Exemplo de Response

```json
{
  "id": 45,
  "question_id": 123,
  "user_id": null,
  "feedback_type": "deletion",
  "content": "[EXCLUSAO] Esta questão contém informações incorretas sobre algoritmos de ordenação. A complexidade informada está errada e pode confundir os estudantes.",
  "status": "pending",
  "created_at": "2024-01-15T14:30:00Z"
}
```

## Observações Importantes

1. **Segurança**: Validar sempre no backend, mesmo que o frontend já valide
2. **Auditoria**: Manter histórico de todas as solicitações
3. **Performance**: Criar índices adequados para consultas frequentes
4. **Rate Limiting**: Considerar limitar número de solicitações por usuário/IP
5. **Conteúdo**: O frontend envia o tipo de solicitação no início do conteúdo como `[CORRECAO]` ou `[EXCLUSAO]` para facilitar identificação

## Testes Recomendados

1. ✅ Criar feedback de correção
2. ✅ Criar feedback de exclusão
3. ✅ Validar conteúdo mínimo (20 caracteres)
4. ✅ Validar tipo inválido
5. ✅ Validar questão inexistente
6. ✅ Listar feedbacks por status
7. ✅ Atualizar status de feedback
8. ✅ Verificar índices do banco de dados

## Próximos Passos

1. Implementar endpoints conforme especificação
2. Adicionar testes unitários e de integração
3. Configurar notificações (opcional)
4. Criar painel administrativo para gerenciar solicitações
5. Implementar sistema de aprovação/rejeição de solicitações

