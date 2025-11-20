# Exemplos de Uso da API

## 1. Criar uma Resposta

```bash
curl -X POST http://localhost:8080/api/answers \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": "q123",
    "answer_text": "Minha resposta para a questão...",
    "user_id": "user456"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "question_id": "q123",
    "answer_text": "Minha resposta para a questão...",
    "user_id": "user456",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## 2. Listar Respostas de uma Questão

```bash
curl http://localhost:8080/api/answers?question_id=q123
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question_id": "q123",
      "answer_text": "Minha resposta...",
      "user_id": "user456",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 3. Criar uma Correção

```bash
curl -X POST http://localhost:8080/api/corrections \
  -H "Content-Type: application/json" \
  -d '{
    "answer_id": 1,
    "is_correct": true,
    "feedback": "Resposta correta!",
    "score": 85.5,
    "detailed_feedback": "Sua resposta está correta, mas poderia ser mais detalhada.",
    "suggestions": "Adicione mais exemplos práticos.",
    "strengths": "Boa compreensão do conceito.",
    "weaknesses": "Falta de exemplos práticos.",
    "confidence": 0.95,
    "time_taken": 1500
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "answer_id": 1,
    "is_correct": true,
    "feedback": "Resposta correta!",
    "score": 85.5,
    "detailed_feedback": "Sua resposta está correta, mas poderia ser mais detalhada.",
    "suggestions": "Adicione mais exemplos práticos.",
    "strengths": "Boa compreensão do conceito.",
    "weaknesses": "Falta de exemplos práticos.",
    "confidence": 0.95,
    "time_taken": 1500,
    "corrected_at": "2024-01-15T10:35:00Z"
  }
}
```

## 4. Listar Correções de uma Resposta

```bash
curl http://localhost:8080/api/corrections?answer_id=1
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "answer_id": 1,
      "is_correct": true,
      "feedback": "Resposta correta!",
      "score": 85.5,
      "corrected_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

## 5. Buscar Resposta por ID

```bash
curl http://localhost:8080/api/answers/1
```

## 6. Buscar Correção por ID

```bash
curl http://localhost:8080/api/corrections/1
```

## 7. Deletar Resposta

```bash
curl -X DELETE http://localhost:8080/api/answers/1
```

## 8. Deletar Correção

```bash
curl -X DELETE http://localhost:8080/api/corrections/1
```

## 9. Health Check

```bash
curl http://localhost:8080/health
```

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected"
}
```

## Exemplo em JavaScript/TypeScript

```typescript
// Criar resposta
async function createAnswer(questionId: string, answerText: string) {
  const response = await fetch('http://localhost:8080/api/answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question_id: questionId,
      answer_text: answerText,
    }),
  });
  return response.json();
}

// Criar correção
async function createCorrection(answerId: number, correction: any) {
  const response = await fetch('http://localhost:8080/api/corrections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answer_id: answerId,
      ...correction,
    }),
  });
  return response.json();
}

// Buscar respostas de uma questão
async function getAnswers(questionId: string) {
  const response = await fetch(
    `http://localhost:8080/api/answers?question_id=${questionId}`
  );
  return response.json();
}

// Buscar correções de uma resposta
async function getCorrections(answerId: number) {
  const response = await fetch(
    `http://localhost:8080/api/corrections?answer_id=${answerId}`
  );
  return response.json();
}
```

