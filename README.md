# HabilitaDev

## Plataforma de Treinamento para Entrevistas Técnicas

HabilitaDev é uma plataforma web moderna desenvolvida para estudantes e profissionais de tecnologia que desejam se preparar para entrevistas técnicas. A plataforma oferece questões reais de grandes empresas de tecnologia, com sistema de respostas da comunidade, comentários e feedback.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Routes](#api-routes)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)
- [Licença](#licença)

---

## Sobre o Projeto

### Missão

Criar um espaço acessível onde estudantes e profissionais possam praticar entrevistas técnicas, testes e desafios de tecnologia, aprendendo com os erros sem pressão e ganhando confiança para conquistar novas oportunidades.

### Características Principais

- **Questões Reais**: Banco de questões de empresas como Itaú, Meta, X (Twitter), Google, Amazon
- **Categorização**: Algoritmos, Estruturas de Dados, Design de Sistema, Bancos de Dados, Frontend, Backend, DevOps
- **Níveis de Dificuldade**: Fácil, Médio, Difícil
- **Comunidade**: Sistema de respostas, comentários e feedback
- **Admin Panel**: Gerenciamento de questões, usuários e estatísticas

---

## Arquitetura

### Arquitetura de Dados

```
Frontend (Next.js) → API Routes (Proxy) → Backend Externo (Render)
                      ↓
                   SQLite (Opcional - apenas desenvolvimento local)
```

### Fluxo de Dados

1. **Frontend** (Next.js App Router)
   - Componentes React com SWR para data-fetching
   - Autenticação com cookies HttpOnly
   - UI com Tailwind CSS e shadcn/ui

2. **API Routes** (Next.js API Routes)
   - Proxy para backend externo (`/api/proxy/*`)
   - Autenticação (`/api/auth/*`)
   - Admin (`/api/admin/*`)

3. **Backend Externo** (Render)
   - API REST completa
   - Banco de dados PostgreSQL
   - Endpoints: `/api/v1/*`

### Sistema de Autenticação

- **Cookies HttpOnly**: Tokens JWT armazenados em cookies HttpOnly (segurança XSS)
- **OAuth**: Google e GitHub (redirecionamento automático)
- **Verificação de Email**: Sistema completo de verificação
- **Recuperação de Senha**: Fluxo completo de reset de senha

---

## Funcionalidades Implementadas

### ✅ Autenticação

- **Login** (`POST /api/auth/login`)
  - Autenticação com email e senha
  - Cookie HttpOnly com JWT
  - Verificação de credenciais

- **Registro** (`POST /api/auth/register`)
  - Criação de conta com username, email e senha
  - Validação de dados
  - Envio de email de verificação
  - Cookie HttpOnly com JWT

- **Verificação de Email** (`GET /api/auth/verify-email`)
  - Verificação de token de email
  - Ativação de conta
  - Redirecionamento após verificação

- **Reenvio de Email de Verificação** (`POST /api/auth/resend-verification-email`)
  - Reenvio de email de verificação
  - Geração de novo token

- **Recuperação de Senha** (`POST /api/auth/forgot-password`)
  - Solicitação de reset de senha
  - Envio de email com token de reset
  - Validação de email

- **Reset de Senha** (`POST /api/auth/reset-password`)
  - Redefinição de senha com token
  - Validação de token
  - Atualização de senha

- **Verificação de Sessão** (`POST /api/auth/verify`)
  - Verificação de sessão via cookie
  - Retorno de dados do usuário
  - Validação de JWT

- **Logout** (`POST /api/auth/logout`)
  - Limpeza de cookie de autenticação
  - Encerramento de sessão

- **OAuth** (Google e GitHub)
  - Redirecionamento para provider OAuth
  - Callback automático (`GET /api/auth/oauth/callback`)
  - Configuração de cookie HttpOnly
  - Integração com backend externo

### ✅ Sistema de Questões

- **Listagem de Questões** (`GET /api/proxy/questions`)
  - Busca de questões do backend
  - Filtros por dificuldade, categoria, empresa
  - Busca por palavras-chave
  - Paginação (se suportado pelo backend)

- **Detalhes de Questão** (`GET /api/proxy/questions/[id]`)
  - Busca de questão específica
  - Exibição de descrição, resposta e metadados

- **Criação de Questão** (`POST /api/proxy/questions`)
  - Criação de nova questão
  - Validação de dados
  - Envio para backend

- **Atualização de Questão** (`PUT /api/proxy/questions/[id]`)
  - Atualização de questão existente
  - Validação de dados

- **Exclusão de Questão** (`DELETE /api/proxy/questions/[id]`)
  - Exclusão de questão
  - Validação de permissões

### ✅ Sistema de Respostas

- **Listagem de Respostas** (`GET /api/proxy/questions/[id]/answers`)
  - Busca de respostas de uma questão
  - Ordenação por data
  - Exibição de autor e conteúdo

- **Criação de Resposta** (`POST /api/proxy/questions/[id]/answers`)
  - Criação de nova resposta
  - Validação de dados
  - Suporte a formatação Markdown

### ✅ Sistema de Comentários

- **Listagem de Comentários** (`GET /api/proxy/questions/[id]/comments`)
  - Busca de comentários de uma questão
  - Tipos: Correção, Sugestão
  - Ordenação por data

- **Criação de Comentário** (`POST /api/proxy/questions/[id]/comments`)
  - Criação de novo comentário
  - Validação de dados
  - Tipo de comentário

### ✅ Sistema de Feedback

- **Listagem de Feedback** (`GET /api/proxy/questions/[id]/feedback`)
  - Busca de feedbacks de uma questão
  - Tipos: Correção, Sugestão, Melhoria
  - Status: Pendente, Revisado, Implementado

- **Criação de Feedback** (`POST /api/proxy/questions/[id]/feedback`)
  - Criação de novo feedback
  - Validação de dados
  - Tipo e status de feedback

### ✅ Validação de Respostas

- **Validação por IA** (`POST /api/proxy/questions/[id]/validate-answer`)
  - Validação de resposta do usuário
  - Integração com serviço de IA (opcional)
  - Fallback para validação tradicional
  - Feedback detalhado

### ✅ Painel Administrativo

- **Estatísticas** (`GET /api/admin/stats`)
  - Total de usuários
  - Total de questões
  - Questões pendentes
  - Questões aprovadas
  - Total de feedbacks
  - Taxa de aprovação

- **Questões Pendentes** (`GET /api/admin/pending-questions`)
  - Listagem de questões pendentes de aprovação
  - Filtros e ordenação

- **Gerenciamento de Usuários** (`GET /api/auth/users`, `PUT /api/auth/users`, `DELETE /api/auth/users`)
  - Listagem de usuários
  - Atualização de usuários
  - Exclusão de usuários
  - Alteração de roles

### ✅ Sistema de Email

- **Providers Suportados**:
  - **Resend** (recomendado)
  - **SendGrid** (alternativa)
  - **Console** (desenvolvimento - logs no console)

- **Templates**:
  - Email de verificação
  - Email de reset de senha
  - HTML responsivo

### ✅ Data Fetching

- **SWR** (Stale-While-Revalidate)
  - Cache automático
  - Revalidação em foco
  - Revalidação em reconexão
  - Deduplicação de requisições
  - Refresh automático (configurável)

---

## Tecnologias Utilizadas

### Frontend

- **Next.js 14.2.33**: Framework React com App Router
- **React 18.3.1**: Biblioteca UI
- **TypeScript 5.9.3**: Tipagem estática
- **Tailwind CSS 4.1.17**: Framework CSS utility-first
- **shadcn/ui**: Componentes UI acessíveis
- **SWR 2.3.6**: Data fetching e cache
- **Lucide React**: Ícones modernos
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas

### Backend (API Routes)

- **Next.js API Routes**: API serverless
- **bcryptjs**: Hash de senhas
- **jsonwebtoken**: Autenticação JWT
- **SQLite** (opcional): Banco de dados local (apenas desenvolvimento)
- **Resend/SendGrid**: Envio de emails

### Infraestrutura

- **Vercel**: Deploy e hospedagem
- **Render**: Backend externo
- **Vercel Analytics**: Analytics e métricas

---

## Instalação e Configuração

### Pré-requisitos

- **Node.js 18.x** ou superior
- **pnpm** (recomendado) ou npm/yarn
- **Git**

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/biancaalvess/HabilitaDev.git
cd HabilitaDev
```

### Passo 2: Instalar Dependências

```bash
# Usando pnpm (recomendado)
pnpm install

# Ou usando npm
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as variáveis necessárias (veja seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

### Passo 4: Executar em Desenvolvimento

```bash
# Servidor de desenvolvimento (porta 3001)
pnpm run dev

# Ou servidor local (porta 3000)
pnpm run dev-local
```

Acesse `http://localhost:3001` no navegador.

### Passo 5: Build para Produção

```bash
# Criar build otimizado
pnpm run build

# Iniciar servidor de produção
pnpm start
```

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# ============================================
# Configurações de Banco de Dados
# ============================================
# SQLite (apenas desenvolvimento local)
DATABASE_URL="file:./dev.db"

# ============================================
# Configurações de Autenticação
# ============================================
# Secret JWT (OBRIGATÓRIO em produção)
# Gere uma chave segura: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Tempo de expiração do JWT (padrão: 1d)
JWT_EXPIRES_IN="7d"

# Rounds do bcrypt (padrão: 10)
BCRYPT_ROUNDS=10

# ============================================
# Configurações da API
# ============================================
# URL da API (cliente)
NEXT_PUBLIC_API_URL="/api"

# URL do Backend Externo (OBRIGATÓRIO)
# Backend em Render: https://habilitadev-backend.onrender.com
NEXT_PUBLIC_BACKEND_URL="https://habilitadev-backend.onrender.com"

# Ou use BACKEND_URL apenas no servidor (alternativa)
# BACKEND_URL="https://habilitadev-backend.onrender.com"

# Timeout das requisições (milissegundos)
# Não é necessário configurar (padrão: 30000)

# ============================================
# Configurações de Desenvolvimento
# ============================================
# Ambiente (development, production, test)
NODE_ENV="development"

# URL da aplicação (cliente)
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Nome da aplicação (cliente)
NEXT_PUBLIC_APP_NAME="HabilitaDev"

# ============================================
# Configurações de Email
# ============================================
# Provider de email: 'resend', 'sendgrid', 'console' (padrão: 'console')
EMAIL_PROVIDER="resend"

# Resend API Key (obtenha em https://resend.com/api-keys)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# SendGrid API Key (se usar SendGrid)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Email do remetente
FROM_EMAIL="noreply@habilitadev.com"

# Nome do remetente
FROM_NAME="HabilitaDev"

# ============================================
# Configurações de Rate Limiting (Opcional)
# ============================================
# Habilitar rate limiting (padrão: false)
RATE_LIMIT_ENABLED="false"

# Janela de tempo (milissegundos)
RATE_LIMIT_WINDOW_MS=60000

# Número máximo de requisições
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# Configurações de Cache (Opcional)
# ============================================
# Habilitar cache (padrão: true)
CACHE_ENABLED="true"

# TTL do cache (segundos)
CACHE_TTL_SECONDS=300

# ============================================
# Configurações de Validação por IA (Opcional)
# ============================================
# URL do serviço de validação por IA
AI_VALIDATION_URL="http://localhost:5000"
```

### Variáveis Obrigatórias para Produção

- `JWT_SECRET`: Secret JWT (gerar chave segura)
- `NEXT_PUBLIC_BACKEND_URL`: URL do backend externo
- `RESEND_API_KEY` ou `SENDGRID_API_KEY`: Chave de API de email (para envio de emails)

### Variáveis Opcionais

- `EMAIL_PROVIDER`: Provider de email (padrão: 'console')
- `RATE_LIMIT_ENABLED`: Habilitar rate limiting
- `AI_VALIDATION_URL`: URL do serviço de validação por IA

---

## Estrutura do Projeto

```
HabilitaDev/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticação
│   │   │   ├── login/            # POST /api/auth/login
│   │   │   ├── register/         # POST /api/auth/register
│   │   │   ├── verify/           # POST /api/auth/verify
│   │   │   ├── logout/           # POST /api/auth/logout
│   │   │   ├── verify-email/     # GET /api/auth/verify-email
│   │   │   ├── resend-verification-email/  # POST /api/auth/resend-verification-email
│   │   │   ├── forgot-password/  # POST /api/auth/forgot-password
│   │   │   ├── reset-password/   # POST /api/auth/reset-password
│   │   │   ├── oauth/            # OAuth callbacks
│   │   │   │   └── callback/     # GET /api/auth/oauth/callback
│   │   │   └── users/            # GET, PUT, DELETE /api/auth/users
│   │   ├── admin/                # Admin API
│   │   │   ├── stats/            # GET /api/admin/stats
│   │   │   └── pending-questions/  # GET /api/admin/pending-questions
│   │   └── proxy/                # Proxy para backend externo
│   │       ├── questions/        # GET, POST /api/proxy/questions
│   │       │   └── [id]/         # GET, PUT, DELETE /api/proxy/questions/[id]
│   │       │       ├── answers/  # GET, POST /api/proxy/questions/[id]/answers
│   │       │       ├── comments/ # GET, POST /api/proxy/questions/[id]/comments
│   │       │       ├── feedback/ # GET, POST /api/proxy/questions/[id]/feedback
│   │       │       └── validate-answer/  # POST /api/proxy/questions/[id]/validate-answer
│   │       └── health/           # GET /api/proxy/health
│   ├── auth/                     # Páginas de autenticação
│   │   └── callback/             # Página de callback OAuth
│   ├── admin/                    # Painel administrativo
│   │   └── page.tsx
│   ├── questoes/                 # Página de questões
│   │   └── page.tsx
│   ├── forgot-password/          # Página de recuperação de senha
│   │   └── page.tsx
│   ├── reset-password/           # Página de reset de senha
│   │   └── page.tsx
│   ├── verify-email/             # Página de verificação de email
│   │   └── page.tsx
│   ├── layout.tsx                # Layout raiz
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Estilos globais
│
├── components/                    # Componentes React
│   ├── ui/                       # Componentes shadcn/ui
│   ├── auth/                     # Componentes de autenticação
│   ├── admin/                    # Componentes admin
│   ├── answers/                  # Componentes de respostas
│   ├── comments/                 # Componentes de comentários
│   ├── feedback/                 # Componentes de feedback
│   └── ...                       # Outros componentes
│
├── hooks/                         # Custom React Hooks
│   ├── use-optimized-questions.ts  # Hook para questões (SWR)
│   └── ...                       # Outros hooks
│
├── lib/                           # Utilitários e configurações
│   ├── api.ts                    # Serviço de API
│   ├── api-response.ts           # Helpers de resposta da API
│   ├── auth.tsx                  # Context de autenticação
│   ├── config-simple.ts          # Configurações
│   ├── database-simple.ts          # Serviço de banco de dados (SQLite)
│   ├── email-service.ts          # Serviço de email
│   ├── email-templates.ts        # Templates de email
│   ├── error-handler.ts          # Tratamento de erros
│   ├── fetcher.ts                # Fetcher para SWR
│   ├── jwt-helper.ts             # Helpers JWT
│   └── types.ts                  # TypeScript types
│
├── public/                        # Arquivos estáticos
│   └── ...                       # Imagens e assets
│
├── package.json                   # Dependências
├── tsconfig.json                 # Configuração TypeScript
├── next.config.mjs               # Configuração Next.js
├── tailwind.config.ts            # Configuração Tailwind
├── postcss.config.mjs            # Configuração PostCSS
└── vercel.json                   # Configuração Vercel
```

---

## API Routes

### Autenticação

#### `POST /api/auth/login`
Autentica um usuário e retorna um cookie HttpOnly com JWT.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user",
      "email": "user@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Login realizado com sucesso"
}
```

#### `POST /api/auth/register`
Registra um novo usuário e envia email de verificação.

**Request:**
```json
{
  "username": "user",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user",
      "email": "user@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "email_verification_required": true
  },
  "message": "Conta criada com sucesso! Verifique seu email para confirmar sua conta."
}
```

#### `GET /api/auth/verify-email`
Verifica o email do usuário usando um token.

**Query Parameters:**
- `token`: Token de verificação
- `redirect_url`: URL de redirecionamento (opcional)

#### `POST /api/auth/resend-verification-email`
Reenvia o email de verificação.

**Request:**
```json
{
  "email": "user@example.com"
}
```

#### `POST /api/auth/forgot-password`
Solicita reset de senha.

**Request:**
```json
{
  "email": "user@example.com"
}
```

#### `POST /api/auth/reset-password`
Redefine a senha usando um token.

**Request:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

#### `POST /api/auth/verify`
Verifica a sessão do usuário via cookie HttpOnly.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user",
      "email": "user@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### `POST /api/auth/logout`
Encerra a sessão do usuário e limpa o cookie.

#### `GET /api/auth/oauth/callback`
Callback OAuth para Google/GitHub. Recebe tokens e configura cookie HttpOnly.

**Query Parameters:**
- `access_token`: Token de acesso
- `refresh_token`: Token de refresh (opcional)
- `return_url`: URL de retorno (opcional)
- `error`: Erro (se houver)
- `error_description`: Descrição do erro (se houver)

#### `GET /api/auth/users`
Lista todos os usuários (admin apenas).

#### `PUT /api/auth/users`
Atualiza um usuário (admin apenas).

**Request:**
```json
{
  "id": 1,
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "admin"
}
```

#### `DELETE /api/auth/users`
Exclui um usuário (admin apenas).

**Query Parameters:**
- `id`: ID do usuário

### Admin

#### `GET /api/admin/stats`
Retorna estatísticas do sistema.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalQuestions": 500,
    "pendingQuestions": 10,
    "approvedQuestions": 490,
    "totalFeedback": 50,
    "totalAnswers": 200
  }
}
```

#### `GET /api/admin/pending-questions`
Retorna questões pendentes de aprovação.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Question Title",
      "description": "Question Description",
      "answer": "Answer",
      "difficulty": "medium",
      "category": "algorithms",
      "approved": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Proxy (Backend Externo)

#### `GET /api/proxy/questions`
Busca questões do backend externo.

**Query Parameters:**
- `difficulty`: Filtro por dificuldade (easy, medium, hard)
- `category`: Filtro por categoria
- `company`: Filtro por empresa
- `search`: Busca por palavras-chave

#### `POST /api/proxy/questions`
Cria uma nova questão no backend externo.

#### `GET /api/proxy/questions/[id]`
Busca uma questão específica do backend externo.

#### `PUT /api/proxy/questions/[id]`
Atualiza uma questão no backend externo.

#### `DELETE /api/proxy/questions/[id]`
Exclui uma questão do backend externo.

#### `GET /api/proxy/questions/[id]/answers`
Busca respostas de uma questão.

#### `POST /api/proxy/questions/[id]/answers`
Cria uma nova resposta.

#### `GET /api/proxy/questions/[id]/comments`
Busca comentários de uma questão.

#### `POST /api/proxy/questions/[id]/comments`
Cria um novo comentário.

#### `GET /api/proxy/questions/[id]/feedback`
Busca feedbacks de uma questão.

#### `POST /api/proxy/questions/[id]/feedback`
Cria um novo feedback.

#### `POST /api/proxy/questions/[id]/validate-answer`
Valida uma resposta do usuário (com IA opcional).

**Request:**
```json
{
  "user_answer": "User's answer",
  "correct_answer": "Correct answer",
  "question_context": "Question context"
}
```

#### `GET /api/proxy/health`
Verifica o status do backend externo e banco local.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "frontend": {
      "status": "healthy",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "version": "1.0.0"
    },
    "backend": {
      "status": "healthy",
      "url": "https://habilitadev-backend.onrender.com",
      "lastChecked": "2024-01-01T00:00:00.000Z"
    },
    "database": {
      "status": "healthy",
      "lastChecked": "2024-01-01T00:00:00.000Z",
      "type": "sqlite"
    }
  }
}
```

---

## Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev          # Inicia servidor (porta 3001)
pnpm run dev-local    # Inicia servidor local (porta 3000)

# Produção
pnpm run build        # Cria build otimizado
pnpm start            # Inicia servidor de produção

# Qualidade
pnpm run lint         # Executa ESLint

# Ambiente
pnpm run setup-env    # Configura variáveis de ambiente
pnpm run env:init     # Inicializa .env.local
pnpm run env:validate # Valida variáveis de ambiente
pnpm run env:list     # Lista variáveis de ambiente

# Dependências
pnpm run check-deps   # Verifica dependências não utilizadas
pnpm run clean-deps   # Remove dependências não utilizadas
```

### Estrutura de Commits

Seguimos o padrão Conventional Commits:

```
feat: adicionar nova funcionalidade
fix: corrigir bug
docs: atualizar documentação
style: formatação de código
refactor: refatoração de código
test: adicionar testes
chore: tarefas de manutenção
```

### Boas Práticas

#### Código
- Use TypeScript para tipagem forte
- Siga o padrão de nomenclatura camelCase
- Mantenha componentes pequenos e focados
- Documente funções complexas
- Use SWR para data-fetching
- Use Tailwind CSS para estilização

#### Estilização
- Use Tailwind CSS (não styled-components)
- Mantenha classes organizadas
- Use componentes shadcn/ui quando possível
- Siga o design system estabelecido

#### Performance
- Use SWR para cache e revalidação
- Implemente lazy loading quando apropriado
- Otimize imagens e assets
- Minimize re-renderizações desnecessárias

---

## Deploy

### Vercel (Recomendado)

1. **Conectar Repositório**
   - Conecte seu repositório GitHub ao Vercel
   - Configure variáveis de ambiente

2. **Variáveis de Ambiente**
   - `JWT_SECRET`: Secret JWT (gerar chave segura)
   - `NEXT_PUBLIC_BACKEND_URL`: URL do backend externo
   - `RESEND_API_KEY`: Chave de API do Resend
   - `FROM_EMAIL`: Email do remetente
   - `FROM_NAME`: Nome do remetente

3. **Build**
   - Vercel detecta automaticamente Next.js
   - Build é executado automaticamente
   - Deploy é feito automaticamente

### Netlify

1. **Conectar Repositório**
   - Conecte seu repositório GitHub ao Netlify
   - Configure variáveis de ambiente

2. **Build Settings**
   - Build command: `pnpm run build`
   - Publish directory: `.next`

3. **Variáveis de Ambiente**
   - Mesmas variáveis do Vercel

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## Contato

### Desenvolvedora

**Bianca Alves**

Fullstack Developer especializada em TypeScript, React, Node.js e tecnologias modernas.

- **LinkedIn**: [linkedin.com/in/bianca-alvess](https://www.linkedin.com/in/bianca-alvess/)
- **GitHub**: [github.com/biancaalvess](https://github.com/biancaalvess)
- **Instagram**: [instagram.com/biancaa.tsx](https://www.instagram.com/biancaa.tsx/)
- **Email**: bianca.alvessdasilva@gmail.com
- **Portfolio**: [devbianca.tech](https://devbianca.tech)

---

**Desenvolvido com dedicação por Bianca Alves**

**HabilitaDev** - Democratizando o acesso ao conhecimento técnico de alta qualidade.

---

Última atualização: Janeiro 2025
Versão: 1.0.0
