# HabilitaDev

## Plataforma de Treinamento para Entrevistas Técnicas

HabilitaDev é uma plataforma web moderna e interativa desenvolvida para estudantes e profissionais de tecnologia que desejam se preparar para entrevistas técnicas, testes práticos e desafios de programação. A plataforma oferece um ambiente seguro onde é possível praticar, errar sem pressão e ganhar confiança através de questões reais utilizadas por grandes empresas de tecnologia.

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API e Endpoints](#api-e-endpoints)
- [Componentes Principais](#componentes-principais)
- [Desenvolvimento](#desenvolvimento)
- [Contribuindo](#contribuindo)
- [Roadmap](#roadmap)
- [Licença](#licença)
- [Contato](#contato)

---

## Sobre o Projeto

### Missão

Criar um espaço acessível onde estudantes e profissionais possam praticar entrevistas técnicas, testes e desafios de tecnologia, aprendendo com os erros sem pressão e ganhando confiança para conquistar novas oportunidades.

### Visão

Ser a principal plataforma de preparação técnica em português, onde pessoas de diferentes níveis e áreas da tecnologia possam aprender juntas, ganhar confiança e crescer em comunidade.

### Valores

- **Acessibilidade**: Conhecimento técnico de alta qualidade disponível para todos
- **Comunidade**: Ambiente colaborativo e de apoio mútuo
- **Qualidade**: Questões reais e atualizadas de empresas renomadas
- **Evolução Contínua**: Plataforma em constante melhoria e expansão

---

## Principais Funcionalidades

### Sistema de Questões

#### Banco de Questões Completo
- Questões reais de empresas como Itaú, Meta, X (Twitter), Google, Amazon e outras grandes techs
- Categorização por área: Algoritmos, Estruturas de Dados, Design de Sistema, Bancos de Dados, Frontend, Backend, DevOps
- Níveis de dificuldade: Fácil, Médio, Difícil
- Soluções detalhadas e explicadas
- Tags e palavras-chave para facilitar a busca

#### Sistema de Filtros Avançados
- Filtro por dificuldade
- Filtro por categoria
- Busca por palavras-chave
- Filtros combinados para pesquisas específicas

### Sistema de Respostas da Comunidade

#### Compartilhamento de Soluções
- Usuários podem publicar suas próprias soluções
- Nome do autor visível em cada resposta
- Suporte a formatação de código com syntax highlighting
- Marcação de soluções como "Solução Aprovada"
- Cópia rápida de código

#### Recursos para Respostas
- Editor de texto com suporte a Markdown
- Blocos de código formatados
- Explicação de complexidade (tempo e espaço)
- Comparação de diferentes abordagens

### Sistema de Comentários

#### Feedback Colaborativo
- Comentários de correção para apontar erros
- Sugestões de melhorias
- Nome do autor em cada comentário
- Timestamps para rastreamento

#### Tipos de Comentários
- **Correção**: Para reportar erros na questão ou resposta
- **Sugestão**: Para propor melhorias no conteúdo

### Sistema de Feedback Formal

#### Canais de Comunicação
- Feedback estruturado com tipos específicos
- Status de acompanhamento: Pendente, Revisado, Implementado
- Sistema de priorização
- Histórico completo de feedbacks

### Sistema de Contato

#### Modal de Contato Integrado
- Formulário completo com validação
- Tipos de contato: Reclamação, Sugestão, Reportar Bug, Nova Funcionalidade, Outro
- Envio direto por email
- Design moderno com gradientes e animações

### Interface e Experiência do Usuário

#### Landing Page Moderna
- Design futurista com elementos 3D
- Animações suaves e interativas
- Seção "Sobre" detalhada
- Call-to-Actions estratégicos
- Footer completo com links e contato

#### Sistema de Navegação
- Sidebar lateral com categorias
- Header com navegação principal
- Breadcrumbs para localização
- Transições suaves entre páginas

#### Tema e Estilização
- Design system consistente
- Paleta de cores profissional (azul e slate)
- Modo escuro otimizado
- Componentes reutilizáveis do shadcn/ui
- Animações com Tailwind CSS

---

## Tecnologias Utilizadas

### Frontend Framework

#### Next.js 14.2.16
- React 18 com Server Components
- App Router para roteamento moderno
- Static Site Generation (SSG)
- Server-Side Rendering (SSR)
- API Routes integradas
- Fast Refresh para desenvolvimento

#### React 18
- Hooks para gerenciamento de estado
- Context API para estado global
- Custom Hooks para lógica reutilizável
- Componentes funcionais
- Concurrent Features

### Styling e UI

#### Tailwind CSS 4.1.9
- Utility-first CSS framework
- JIT (Just-In-Time) compiler
- Custom configuration
- Responsive design
- Dark mode support

#### shadcn/ui
- Biblioteca de componentes acessíveis
- Baseado em Radix UI
- Totalmente customizável
- TypeScript nativo
- Componentes reutilizáveis:
  - Dialog, Alert, Card, Button
  - Input, Textarea, Select
  - Tabs, Accordion, Tooltip
  - Badge, Separator, Skeleton
  - E muitos outros

#### Lucide React
- Ícones modernos e consistentes
- SVG otimizados
- Totalmente customizáveis
- Tree-shakeable

### Tipagem e Validação

#### TypeScript 5
- Tipagem estática forte
- Interfaces e tipos customizados
- IntelliSense aprimorado
- Detecção de erros em tempo de desenvolvimento

#### Zod 3.25.67
- Schema validation
- Type inference
- Runtime type checking
- Integração com React Hook Form

### Gerenciamento de Estado

#### Context API
- Contextos para Authentication
- Contextos para Feedback
- Contextos para Comments
- Contextos para Answers

#### React Hook Form 7.60.0
- Formulários performáticos
- Validação integrada
- Menor re-renderização
- API simples e intuitiva

### Fontes e Tipografia

#### Geist Font Family
- Geist Sans para textos
- Geist Mono para código
- Otimização de carregamento
- Suporte a caracteres especiais

### Animações e Efeitos

#### Framer Motion (via components)
- Animações declarativas
- Gestos e interações
- Transições de página
- Scroll animations

#### Tailwind Animate
- Utilitários de animação
- Keyframes customizados
- Efeitos de hover
- Loading states

### Analytics e Monitoramento

#### Vercel Analytics
- Métricas de performance
- Core Web Vitals
- Rastreamento de usuários
- Real-time analytics

### Data Fetching

#### Fetch API Nativa
- Requisições HTTP
- Integração com API backend
- Error handling
- Loading states

### Backend Integration

#### API REST
- Base URL: https://habilitadev-backend.onrender.com
- Endpoints RESTful
- JSON responses
- Error handling

---

## Arquitetura do Sistema

### Estrutura de Diretórios

```
HabilitaDev/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raiz com providers
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Estilos globais
│   ├── questoes/                # Página de questões
│   │   └── page.tsx
│   ├── contribuir/              # Página de contribuição
│   │   └── page.tsx
│   ├── admin/                   # Painel administrativo
│   │   └── page.tsx
│   └── sobre/                   # Página sobre
│
├── components/                   # Componentes React
│   ├── ui/                      # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (40+ componentes)
│   │
│   ├── answers/                 # Sistema de respostas
│   │   ├── answer-form.tsx
│   │   └── answer-list.tsx
│   │
│   ├── comments/                # Sistema de comentários
│   │   ├── comment-form.tsx
│   │   └── comment-list.tsx
│   │
│   ├── feedback/                # Sistema de feedback
│   │   ├── feedback-form.tsx
│   │   └── feedback-list.tsx
│   │
│   ├── admin/                   # Componentes admin
│   │   ├── admin-sidebar.tsx
│   │   ├── admin-stats.tsx
│   │   ├── feedback-management.tsx
│   │   └── questions-table.tsx
│   │
│   ├── auth/                    # Autenticação
│   │   ├── auth-modal.tsx
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   │
│   ├── hero-section.tsx         # Landing page hero
│   ├── footer.tsx               # Footer global
│   ├── header.tsx               # Header/Navbar
│   ├── contact-modal.tsx        # Modal de contato
│   ├── question-card.tsx        # Card de questão
│   ├── question-detail.tsx      # Detalhes da questão
│   ├── question-filters.tsx     # Filtros de questões
│   ├── questoes-sidebar.tsx     # Sidebar de categorias
│   └── questoes-header.tsx      # Header de questões
│
├── hooks/                        # Custom React Hooks
│   ├── use-api.ts               # Hooks para API
│   ├── use-mobile.ts            # Hook para mobile detection
│   └── use-toast.ts             # Hook para notificações
│
├── lib/                          # Utilitários e configurações
│   ├── api.ts                   # Serviço de API
│   ├── types.ts                 # TypeScript types
│   ├── utils.ts                 # Funções utilitárias
│   ├── auth.tsx                 # Context de autenticação
│   ├── answers.tsx              # Context de respostas
│   ├── comments.tsx             # Context de comentários
│   ├── feedback.tsx             # Context de feedback
│   └── mock-data.ts             # Dados de exemplo
│
├── public/                       # Arquivos estáticos
│   ├── placeholder-logo.svg
│   └── ... (imagens e assets)
│
├── styles/                       # Estilos adicionais
│   └── globals.css
│
├── package.json                  # Dependências do projeto
├── tsconfig.json                # Configuração TypeScript
├── tailwind.config.ts           # Configuração Tailwind
├── next.config.mjs              # Configuração Next.js
├── postcss.config.mjs           # Configuração PostCSS
└── components.json              # Configuração shadcn/ui
```

### Fluxo de Dados

#### 1. Carregamento Inicial
```
Usuario → Next.js App → API Service → Backend API → Response
                                                         ↓
Usuario ← React Component ← State Update ← Data Processing
```

#### 2. Interação com Questões
```
Usuario → Visualiza Questões → Aplica Filtros → Lista Atualizada
          ↓
          Seleciona Questão → Carrega Detalhes → Exibe Resposta
                                                    ↓
                                                  Respostas da Comunidade
                                                  Comentários
                                                  Feedback
```

#### 3. Sistema de Respostas
```
Usuario → Preenche Formulário → Valida Dados → Envia para API
                                                     ↓
Usuario ← Atualiza UI ← Recebe Confirmação ← API Response
```

---

## Instalação e Configuração

### Pré-requisitos

- Node.js 18.x ou superior
- npm, yarn ou pnpm
- Git

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/biancaalvess/HabilitaDev.git
cd HabilitaDev
```

### Passo 2: Instalar Dependências

```bash
# Usando npm
npm install

# Usando yarn
yarn install

# Usando pnpm
pnpm install
```

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://habilitadev-backend.onrender.com

# Analytics (opcional)
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

### Passo 4: Executar em Desenvolvimento

```bash
# Servidor de desenvolvimento (porta 3001)
npm run dev

# Ou servidor local (porta 3000)
npm run dev-local
```

Acesse `http://localhost:3001` no navegador.

### Passo 5: Build para Produção

```bash
# Criar build otimizado
npm run build

# Iniciar servidor de produção
npm start
```

---

## Como Usar

### Para Estudantes e Profissionais

#### 1. Acessar a Plataforma
- Abra o navegador e acesse a URL da aplicação
- Navegue pela landing page para conhecer o projeto

#### 2. Explorar Questões
- Clique em "Questões" no menu ou no botão "Vamos Começar"
- Use os filtros para encontrar questões específicas:
  - Selecione a dificuldade desejada
  - Escolha uma categoria
  - Use a busca por palavras-chave

#### 3. Resolver uma Questão
- Clique em "Ver detalhes" na questão desejada
- Leia a descrição do problema
- Analise a solução oficial
- Compare com as respostas da comunidade

#### 4. Contribuir com Respostas
- Clique no botão "Responder Questão"
- Digite seu nome
- Escreva sua solução (com código se necessário)
- Use ``` para blocos de código
- Clique em "Enviar Resposta"

#### 5. Adicionar Comentários
- Clique no botão "Comentar"
- Escolha o tipo: Correção ou Sugestão
- Escreva seu comentário
- Envie para a comunidade

### Para Administradores

#### 1. Acessar Painel Admin
- Navegue para `/admin`
- Faça login com credenciais de administrador

#### 2. Gerenciar Questões
- Visualize todas as questões cadastradas
- Aprove ou rejeite novas questões
- Edite questões existentes
- Gerencie categorias e tags

#### 3. Moderar Conteúdo
- Revise respostas da comunidade
- Aprove ou remova comentários
- Gerencie feedbacks recebidos

---

## Estrutura do Projeto

### Componentes UI (shadcn/ui)

A aplicação utiliza mais de 40 componentes do shadcn/ui, incluindo:

- **Formulários**: Input, Textarea, Select, Checkbox, Radio, Switch
- **Navegação**: Dialog, Dropdown, Menu, Tabs, Navigation Menu
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Layout**: Card, Separator, Scroll Area, Resizable
- **Interação**: Button, Tooltip, Popover, Hover Card
- **Data Display**: Table, Badge, Avatar, Calendar

### Hooks Customizados

#### useQuestions
```typescript
const { questions, loading, error, refetch } = useQuestions();
```
Gerencia o carregamento e estado das questões.

#### useAnswers
```typescript
const { answers, loading, error, addAnswer } = useAnswers(questionId);
```
Gerencia respostas de uma questão específica.

#### useComments
```typescript
const { comments, loading, error, addComment } = useComments(questionId);
```
Gerencia comentários de uma questão.

#### useFeedback
```typescript
const { feedback, loading, error, addFeedback } = useFeedback(questionId);
```
Gerencia feedbacks de uma questão.

---

## API e Endpoints

### Base URL
```
https://habilitadev-backend.onrender.com
```

### Endpoints Disponíveis

#### Questões

**GET /questions**
- Retorna todas as questões
- Response: Array<Question>

**GET /questions/:id**
- Retorna uma questão específica
- Response: Question

**POST /questions**
- Cria uma nova questão
- Body: Omit<Question, 'id' | 'created_at'>
- Response: Question

#### Respostas

**GET /questions/:questionId/answers**
- Retorna respostas de uma questão
- Response: Array<Answer>

**POST /questions/:questionId/answers**
- Adiciona uma resposta
- Body: { author_name, content, is_solution }
- Response: Answer

#### Comentários

**GET /questions/:questionId/comments**
- Retorna comentários de uma questão
- Response: Array<Comment>

**POST /questions/:questionId/comments**
- Adiciona um comentário
- Body: { author_name, comment_type, content }
- Response: Comment

#### Feedback

**GET /questions/:questionId/feedback**
- Retorna feedbacks de uma questão
- Response: Array<Feedback>

**POST /questions/:questionId/feedback**
- Adiciona um feedback
- Body: { user_id, feedback_type, content, status }
- Response: Feedback

#### Health Check

**GET /health**
- Verifica status da API
- Response: { status, timestamp }

---

## Componentes Principais

### HeroSection
Landing page com animações e elementos 3D.

**Recursos:**
- Gradientes animados
- Partículas tecnológicas
- Wireframe hands
- Call-to-actions
- Seção sobre com missão, visão e valores

### QuestionCard
Card individual de questão na listagem.

**Recursos:**
- Badge de dificuldade
- Badge de categoria
- Empresa (se disponível)
- Botões de ação
- Hover effects

### QuestionDetail
Visualização completa de uma questão.

**Recursos:**
- Descrição completa
- Solução oficial
- Tags e metadados
- Sistema de respostas
- Sistema de comentários
- Sistema de feedback

### ContactModal
Modal moderno para contato.

**Recursos:**
- Formulário completo
- Validação de campos
- Tipos de contato
- Integração com email
- Design com gradientes

### Footer
Rodapé completo com informações.

**Recursos:**
- Links rápidos
- Categorias
- Redes sociais
- Modal de contato
- Créditos da desenvolvedora

---

## Desenvolvimento

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
- Use hooks customizados para lógica reutilizável

#### Estilização
- Use Tailwind CSS para estilos
- Mantenha classes organizadas
- Use componentes shadcn/ui quando possível
- Siga o design system estabelecido

#### Performance
- Use React.memo para componentes pesados
- Implemente lazy loading quando apropriado
- Otimize imagens e assets
- Minimize re-renderizações desnecessárias

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor (porta 3001)
npm run dev-local    # Inicia servidor local (porta 3000)

# Produção
npm run build        # Cria build otimizado
npm start            # Inicia servidor de produção

# Qualidade
npm run lint         # Executa ESLint
```

---

## Contribuindo

### Como Contribuir

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Siga os padrões de código estabelecidos
- Adicione testes quando apropriado
- Atualize a documentação se necessário
- Descreva claramente as mudanças no PR
- Certifique-se de que o código passa no linting

### Reportando Bugs

Use o modal de contato na plataforma ou crie uma issue no GitHub com:
- Descrição clara do bug
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots se aplicável
- Informações do ambiente (navegador, OS, etc.)

---

## Roadmap

### Versão 1.1
- Sistema de autenticação completo
- Perfis de usuários
- Sistema de pontuação e rankings
- Histórico de respostas
- Estatísticas pessoais

### Versão 1.2
- Editor de código integrado
- Execução de código em tempo real
- Testes automatizados para soluções
- Sistema de badges e conquistas

### Versão 1.3
- Mode competitivo
- Desafios semanais
- Sistema de mentoria
- Certificados de conclusão

### Versão 2.0
- Aplicativo mobile (React Native)
- Modo offline
- Notificações push
- Integração com GitHub
- API pública

---

## Tecnologias Futuras

### Planejado para Implementação

- **GraphQL**: Para queries mais eficientes
- **Redis**: Para caching
- **WebSockets**: Para features em tempo real
- **Docker**: Para containerização
- **Kubernetes**: Para orquestração
- **CI/CD**: Pipeline automatizado

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

### Suporte

Para dúvidas, sugestões ou reportar problemas:

1. Use o modal de contato na plataforma
2. Envie um email para bianca.alvessdasilva@gmail.com
3. Abra uma issue no GitHub

---

## Agradecimentos

- Comunidade Next.js pela framework incrível
- Equipe do shadcn/ui pelos componentes
- Vercel pela hospedagem e analytics
- Todos os contribuidores e usuários da plataforma

---

## Stack Completo

### Frontend
- Next.js 14.2.16
- React 18
- TypeScript 5
- Tailwind CSS 4.1.9
- shadcn/ui
- Radix UI
- Lucide React
- React Hook Form
- Zod

### Backend (Integração)
- API REST
- JSON responses
- Error handling
- CORS enabled

### Ferramentas de Desenvolvimento
- ESLint
- Prettier
- Git
- npm/yarn/pnpm

### Deploy e Hospedagem
- Vercel (recomendado)
- Vercel Analytics
- Edge Functions

---

**Desenvolvido com dedicação por Bianca Alves**

**HabilitaDev** - Democratizando o acesso ao conhecimento técnico de alta qualidade.

---

Última atualização: Setembro 2025
Versão: 1.0.0
