# 🔧 Guia de Resolução de Problemas - HabilitaDev

## 🚨 Erros Comuns e Soluções

### 1. **ERR_CONNECTION_RESET / Failed to fetch RSC payload**

**Sintomas:**
```
Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
Failed to fetch RSC payload for http://localhost:3001/
```

**Causas:**
- Extensões do browser interferindo
- Cache corrompido
- Conexões antigas não fechadas

**Soluções:**

#### ✅ **Solução 1: Limpar Cache do Browser**
```bash
# Chrome/Edge
Ctrl + Shift + R (Hard Refresh)
F12 > Application > Storage > Clear storage

# Firefox
Ctrl + Shift + R
F12 > Storage > Clear All
```

#### ✅ **Solução 2: Reiniciar Servidor**
```bash
# Parar servidor atual
Ctrl + C

# Limpar cache do Next.js
rm -rf .next

# Reiniciar servidor
npm run dev
```

#### ✅ **Solução 3: Modo Incógnito**
- Abrir o site em modo incógnito/privado
- Testar sem extensões ativas

#### ✅ **Solução 4: Verificar Portas**
```bash
# Verificar se a porta está ocupada
netstat -ano | findstr :3001

# Matar processo se necessário
taskkill /F /PID [PID_NUMBER]
```

### 2. **Problemas de Navegação (RSC)**

**Sintomas:**
```
Failed to fetch RSC payload for http://localhost:3001/contribuir
```

**Solução:**
- Verificar se todas as páginas existem
- Limpar cache do browser
- Reiniciar servidor de desenvolvimento

### 3. **Erros de Autenticação**

**Sintomas:**
- Login não funciona
- Token inválido
- Erro 401/403

**Solução:**
```bash
# Limpar localStorage
F12 > Application > Local Storage > Clear All

# Ou usar conta de teste:
# Email: admin@habilitadev.com
# Senha: password
```

### 4. **Problemas de Build**

**Sintomas:**
```
Type error: Cannot find module
Build failed
```

**Solução:**
```bash
# Limpar node_modules
rm -rf node_modules
rm package-lock.json

# Reinstalar dependências
npm install

# Build limpo
npm run build
```

## 🛠️ **Comandos Úteis**

### **Desenvolvimento:**
```bash
npm run dev          # Servidor desenvolvimento (porta 3001)
npm run dev-local    # Servidor local (porta 3000)
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar erros ESLint
```

### **Limpeza:**
```bash
# Limpar cache Next.js
rm -rf .next

# Limpar node_modules
rm -rf node_modules package-lock.json
npm install

# Limpar cache npm
npm cache clean --force
```

### **Debug:**
```bash
# Verificar portas em uso
netstat -ano | findstr :3001

# Verificar processos Node.js
tasklist | findstr node

# Logs detalhados
npm run dev -- --verbose
```

## 🔍 **Verificações de Saúde**

### **1. Servidor Funcionando:**
```bash
curl http://localhost:3001
# Deve retornar HTML da página inicial
```

### **2. APIs Funcionando:**
```bash
curl http://localhost:3001/api/questions
# Deve retornar JSON com questões
```

### **3. Autenticação:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@habilitadev.com","password":"password"}'
```

## 🚀 **Prevenção de Problemas**

### **1. Sempre usar:**
- Modo incógnito para testes
- Hard refresh (Ctrl + Shift + R) após mudanças
- Limpeza regular do cache

### **2. Evitar:**
- Múltiplas instâncias do servidor
- Modificações diretas no .next
- Cache antigo do browser

### **3. Boas Práticas:**
- Reiniciar servidor após mudanças grandes
- Verificar logs do console
- Testar em múltiplos browsers

## 📞 **Suporte**

Se os problemas persistirem:

1. **Verificar logs do console** (F12 > Console)
2. **Verificar logs do servidor** (terminal onde roda npm run dev)
3. **Testar em modo incógnito**
4. **Verificar se todas as dependências estão instaladas**

### **Informações para Debug:**
- Versão do Node.js: `node --version`
- Versão do npm: `npm --version`
- Sistema operacional: Windows/Linux/Mac
- Browser utilizado: Chrome/Firefox/Edge

---

**💡 Dica:** A maioria dos problemas de desenvolvimento são resolvidos com um hard refresh (Ctrl + Shift + R) e reinicialização do servidor!
