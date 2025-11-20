# HabilitaDev Backend - Go + SQLite

Backend em Go para armazenar respostas e correções de questões.

## Estrutura

- **answers**: Armazena apenas as respostas dos usuários (não armazena questões)
- **corrections**: Armazena as correções/sugestões das respostas

## Requisitos

- Go 1.21 ou superior
- modernc.org/sqlite (driver SQLite puro Go, sem CGO)

## Instalação

```bash
cd backend
go mod download
go build -o habilitadev-backend
```

## Execução

```bash
# Desenvolvimento
go run main.go

# Produção
./habilitadev-backend
```

## Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 8080)

## Endpoints

### Health Check
- `GET /health` - Verifica status do servidor

### Answers (Respostas)
- `GET /api/answers?question_id=<id>` - Lista respostas de uma questão
- `POST /api/answers` - Cria uma nova resposta
- `GET /api/answers/<id>` - Busca uma resposta por ID
- `DELETE /api/answers/<id>` - Remove uma resposta

### Corrections (Correções)
- `GET /api/corrections?answer_id=<id>` - Lista correções de uma resposta
- `POST /api/corrections` - Cria uma nova correção
- `GET /api/corrections/<id>` - Busca uma correção por ID
- `DELETE /api/corrections/<id>` - Remove uma correção

## Estrutura do Banco de Dados

O banco de dados SQLite é criado automaticamente em `data/database.db`.

### Tabela: answers
- `id`: ID único
- `question_id`: ID da questão (string, não armazenada no banco)
- `answer_text`: Texto da resposta
- `user_id`: ID do usuário (opcional)
- `created_at`: Data de criação

### Tabela: corrections
- `id`: ID único
- `answer_id`: ID da resposta (foreign key)
- `is_correct`: Se a resposta está correta
- `feedback`: Feedback geral
- `score`: Pontuação (0-100)
- `detailed_feedback`: Feedback detalhado
- `suggestions`: Sugestões de melhoria
- `strengths`: Pontos fortes
- `weaknesses`: Pontos fracos
- `confidence`: Nível de confiança da correção
- `time_taken`: Tempo gasto na correção (ms)
- `corrected_at`: Data da correção

## Backup

Para fazer backup do banco de dados, simplesmente copie o arquivo `data/database.db`.

