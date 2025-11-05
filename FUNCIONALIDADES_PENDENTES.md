# Funcionalidades Pendentes - HabilitaDev

## 📋 Status Geral

### ✅ **Implementado**
- ✅ Sistema de autenticação (login/registro)
- ✅ Visualização de questões
- ✅ Sistema de feedback
- ✅ Sistema de respostas
- ✅ Painel administrativo (UI)
- ✅ Proxy para backend externo
- ✅ Fallback para banco local
- ✅ Tratamento de erros e timeouts

---

## 🚨 **CRÍTICO - Falta Implementar**

### 1. **Verificação de Email** ⚠️
**Status:** Parcialmente implementado (backend mencionado, mas rotas não encontradas)

**Falta:**
- ✅ Backend: Rota `/api/v1/auth/verify-email` (GET e POST)
- ❌ Frontend: Rota `/api/auth/verify-email` 
- ❌ Frontend: Rota `/api/auth/resend-verification-email`
- ❌ Frontend: Página de verificação de email
- ❌ Frontend: Componente para reenvio de email
- ❌ Frontend: Integração com backend para envio de emails
- ❌ Frontend: Mensagem de verificação pendente no registro

**Arquivos necessários:**
- `app/api/auth/verify-email/route.ts`
- `app/api/auth/resend-verification-email/route.ts`
- `app/verify-email/page.tsx` (página de verificação)
- `components/auth/email-verification-notice.tsx`

---

### 2. **Recuperação de Senha (Forgot Password)** ❌
**Status:** Não implementado

**Falta:**
- ❌ Backend: Rota `/api/v1/auth/forgot-password` (POST)
- ❌ Backend: Rota `/api/v1/auth/reset-password` (POST)
- ❌ Frontend: Rota `/api/auth/forgot-password`
- ❌ Frontend: Rota `/api/auth/reset-password`
- ❌ Frontend: Página de "Esqueci minha senha"
- ❌ Frontend: Página de reset de senha
- ❌ Frontend: Componente de formulário de recuperação
- ❌ Frontend: Integração com backend para envio de email de reset

**Arquivos necessários:**
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `components/auth/forgot-password-form.tsx`

---

### 3. **Admin - Gerenciamento de Questões** ⚠️
**Status:** UI implementada, mas ações não conectadas ao backend

**Falta:**
- ❌ Backend: Conectar ações de aprovar/rejeitar ao backend
- ❌ Backend: Conectar edição de questões ao backend
- ❌ Backend: Conectar exclusão de questões ao backend
- ❌ Backend: Buscar questões pendentes do backend
- ❌ Frontend: Integração com API para aprovar/rejeitar
- ❌ Frontend: Modal de edição de questões
- ❌ Frontend: Confirmação de exclusão

**Arquivos a modificar:**
- `components/admin/questions-table.tsx` (conectar ações)
- `app/api/proxy/questions/[id]/route.ts` (adicionar PUT e DELETE)

---

### 4. **Admin - Gerenciamento de Usuários** ❌
**Status:** Apenas placeholder

**Falta:**
- ❌ Backend: Rota para listar usuários
- ❌ Backend: Rota para editar usuários
- ❌ Backend: Rota para deletar usuários
- ❌ Backend: Rota para alterar roles
- ❌ Frontend: Componente de tabela de usuários
- ❌ Frontend: Ações de edição/exclusão
- ❌ Frontend: Modal de edição de usuário

**Arquivos necessários:**
- `app/api/auth/users/route.ts` (GET, PUT, DELETE)
- `components/admin/users-table.tsx`

---

### 5. **Admin - Configurações** ❌
**Status:** Apenas placeholder

**Falta:**
- ❌ Formulário de configurações gerais
- ❌ Configurações de email (SMTP)
- ❌ Configurações de cache
- ❌ Configurações de rate limiting

---

## ⚠️ **IMPORTANTE - Melhorias Necessárias**

### 6. **Envio de Emails** ❌
**Status:** Não configurado

**Falta:**
- ❌ Configuração de SMTP (Resend, SendGrid, etc.)
- ❌ Templates de email (verificação, reset, etc.)
- ❌ Serviço de envio de emails
- ❌ Fila de emails (opcional)

**Arquivos necessários:**
- `lib/email-service.ts`
- `lib/email-templates/` (pasta com templates)
- Configuração de variáveis de ambiente

---

### 7. **Estatísticas Reais no Admin** ⚠️
**Status:** Dados mockados

**Falta:**
- ❌ Buscar estatísticas reais do backend
- ❌ Gráficos com dados reais
- ❌ Métricas de uso

---

### 8. **OAuth (Google, GitHub, Twitter)** ⚠️
**Status:** UI existe, mas não implementado

**Falta:**
- ❌ Backend: Integração com OAuth providers
- ❌ Frontend: Configuração de OAuth
- ❌ Frontend: Callbacks de OAuth

---

### 9. **Sistema de Comentários** ⚠️
**Status:** Parcialmente implementado

**Falta:**
- ❌ Verificar se rotas de comentários estão funcionando
- ❌ UI para exibir comentários
- ❌ Formulário de comentários

---

### 10. **Validação de Respostas** ⚠️
**Status:** Rota existe, mas não testada

**Falta:**
- ❌ Testar endpoint `/api/proxy/questions/[id]/validate-answer`
- ❌ UI para validação de respostas
- ❌ Feedback de validação

---

## 📊 **Prioridades**

### 🔴 **Alta Prioridade**
1. **Verificação de Email** - Essencial para funcionalidade completa
2. **Recuperação de Senha** - Funcionalidade básica esperada
3. **Admin - Gerenciamento de Questões** - Funcionalidade principal do admin

### 🟡 **Média Prioridade**
4. **Envio de Emails** - Necessário para verificação e reset
5. **Admin - Gerenciamento de Usuários** - Importante para administração
6. **Estatísticas Reais** - Melhora a experiência do admin

### 🟢 **Baixa Prioridade**
7. **OAuth** - Funcionalidade extra
8. **Admin - Configurações** - Pode ser feito depois
9. **Sistema de Comentários** - Verificar se está funcionando
10. **Validação de Respostas** - Testar e melhorar

---

## 🔧 **Tarefas Técnicas Pendentes**

- [ ] Configurar SMTP para envio de emails
- [ ] Criar tabela `email_verification_tokens` no banco
- [ ] Criar tabela `password_reset_tokens` no banco
- [ ] Implementar migrations do banco de dados
- [ ] Adicionar testes unitários
- [ ] Adicionar testes de integração
- [ ] Documentação da API
- [ ] Melhorar tratamento de erros
- [ ] Adicionar logging estruturado
- [ ] Implementar rate limiting real
- [ ] Adicionar monitoramento (Sentry, etc.)

---

## 📝 **Notas**

- O backend menciona verificação de email, mas as rotas não foram encontradas no frontend
- O admin tem UI completa, mas as ações não estão conectadas ao backend
- O sistema de emails precisa ser configurado para funcionar completamente
- Algumas funcionalidades têm UI pronta, mas faltam as integrações com backend

