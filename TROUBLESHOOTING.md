# 🔧 Troubleshooting - HabilitaDev

## ❌ Erro 500 ao Carregar Questões

### **Sintoma:**
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
API request failed: Error: HTTP error! status: 500
```

---

## 🔍 **Diagnóstico Rápido**

### **1. Verificar se o Backend está Rodando**

```bash
# Windows PowerShell
Test-NetConnection -ComputerName localhost -Port 8000

# Se não estiver rodando:
cd ../HabilitaDev-backend
uvicorn app.main:app --reload --port 8000
```

### **2. Verificar Logs do Backend**

Abra o terminal onde o backend está rodando e procure por:
- ❌ Erros de conexão com banco de dados
- ❌ Erros de imports ou módulos
- ❌ Erros de validação

### **3. Testar Backend Diretamente**

```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:8000/api/v1/questions -UseBasicParsing

# Linux/Mac
curl http://localhost:8000/api/v1/questions
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": [...],
  "total": 10
}
```

---

## 🐛 **Problemas Comuns e Soluções**

### **Problema 1: Banco de Dados Offline**

**Erro no Backend:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solução:**
```bash
# Iniciar PostgreSQL
# Windows
net start postgresql

# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql
```

---

### **Problema 2: Tabelas Não Criadas**

**Erro no Backend:**
```
sqlalchemy.exc.ProgrammingError: relation "questions" does not exist
```

**Solução:**
```bash
cd ../HabilitaDev-backend

# Rodar migrations
alembic upgrade head

# Ou criar banco do zero
python -m app.db.init_db
```

---

### **Problema 3: Banco de Dados Vazio**

**Sintoma:** Backend retorna array vazio `[]`

**Solução:**
```bash
# Popular banco com dados de exemplo
curl -X POST http://localhost:8000/api/v1/questions/populate \
  -H "Content-Type: application/json"
```

**Ou via Python:**
```python
# No terminal do backend
python -m app.scripts.seed_data
```

---

### **Problema 4: Variáveis de Ambiente Incorretas**

**Verifique o `.env` do backend:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/habilitadev_db
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

**Verifique o `.env.local` do frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### **Problema 5: Backend em Produção Dormindo**

Se estiver usando Render.com ou Heroku (free tier), o backend pode estar dormindo.

**Sintoma:** Primeira requisição demora 30+ segundos e dá timeout

**Solução:**
1. Aguarde 1-2 minutos para o backend "acordar"
2. Ou configure para usar backend local durante desenvolvimento

---

## 🔍 **Debug Passo a Passo**

### **Passo 1: Verificar Backend**

```bash
# Testar health check
curl http://localhost:8000/health

# Resposta esperada:
{"status":"healthy","timestamp":"2025-01-08T..."}
```

### **Passo 2: Verificar Banco de Dados**

```bash
# Conectar ao PostgreSQL
psql -U postgres -d habilitadev_db

# Verificar tabelas
\dt

# Verificar se há questões
SELECT COUNT(*) FROM questions;

# Sair
\q
```

### **Passo 3: Verificar Logs do Next.js**

No terminal do Next.js, procure por:
```
Fetching from: http://localhost:8000/api/v1/questions
Backend response status: 500
Backend error response: {...}
```

Isso mostra o erro exato do backend.

---

## 🚀 **Solução Rápida (Start from Scratch)**

Se nada funcionar, reinicie tudo:

### **1. Backend:**
```bash
cd ../HabilitaDev-backend

# Parar servidor (Ctrl+C)

# Limpar banco
dropdb habilitadev_db
createdb habilitadev_db

# Criar tabelas
alembic upgrade head

# Popular dados
python -m app.scripts.seed_data

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

### **2. Frontend:**
```bash
cd HabilitaDev

# Parar servidor (Ctrl+C)

# Limpar cache
Remove-Item -Recurse -Force .next

# Reinstalar dependências (opcional)
npm install

# Iniciar servidor
npm run dev
```

---

## 📊 **Verificação Final**

Após reiniciar tudo, teste:

```bash
# 1. Backend health
curl http://localhost:8000/health

# 2. Questões
curl http://localhost:8000/api/v1/questions

# 3. Frontend
# Abra http://localhost:3001 no navegador
```

---

## 🆘 **Ainda com Problemas?**

### **Coletar Informações de Debug:**

```bash
# 1. Versão do Node
node --version

# 2. Versão do Python
python --version

# 3. Status do PostgreSQL
# Windows
sc query postgresql

# Linux/Mac
systemctl status postgresql

# 4. Logs do Backend
# Copie os últimos 50 linhas do terminal do backend
```

### **Logs Úteis:**

**Backend:**
- Erros de SQL
- Erros de imports
- Traceback completo

**Frontend:**
- Console do navegador (F12)
- Terminal do Next.js
- Network tab (F12 → Network)

---

## 💡 **Dicas de Prevenção**

1. **Sempre iniciar backend primeiro, depois frontend**
2. **Verificar se PostgreSQL está rodando antes de iniciar**
3. **Manter `.env` e `.env.local` atualizados**
4. **Fazer backup do banco regularmente**
5. **Usar Docker para ambiente consistente** (opcional)

---

## 📝 **Checklist de Desenvolvimento**

Antes de iniciar desenvolvimento, verifique:

- [ ] PostgreSQL rodando
- [ ] Backend rodando em `localhost:8000`
- [ ] Backend respondendo em `/health`
- [ ] Banco tem dados (ou pode criar)
- [ ] Frontend rodando em `localhost:3001`
- [ ] `.env.local` configurado
- [ ] Console sem erros

---

## 🔗 **Links Úteis**

- Backend Health: http://localhost:8000/health
- Backend Docs: http://localhost:8000/docs
- Backend Admin: http://localhost:8000/admin
- Frontend: http://localhost:3001
- Frontend API: http://localhost:3001/api/proxy/questions

---

**🎯 Se seguir esses passos e ainda tiver problemas, o erro provavelmente está no código do backend, não no frontend!**

