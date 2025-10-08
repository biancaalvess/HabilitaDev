# 🤖 Exemplo de Implementação do Serviço de IA

## 📝 **Visão Geral**

Este documento fornece um exemplo completo de como implementar o serviço de validação por IA que o HabilitaDev espera.

---

## 🐍 **Exemplo 1: Serviço Python com Flask + OpenAI**

### **Arquivo: app.py**

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Habilita CORS para todas as rotas

# Configurar OpenAI API Key
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/validate', methods=['POST'])
def validate_answer():
    """
    Endpoint para validar respostas usando OpenAI GPT
    """
    try:
        # Receber dados da requisição
        data = request.get_json()
        
        user_answer = data.get('user_answer', '')
        correct_answer = data.get('correct_answer', '')
        question_context = data.get('question_context', '')
        question_id = data.get('question_id', '')
        
        # Validar dados recebidos
        if not user_answer or not correct_answer:
            return jsonify({
                'error': 'user_answer e correct_answer são obrigatórios'
            }), 400
        
        # Construir prompt para a IA
        prompt = f"""
Você é um avaliador técnico especializado em entrevistas de programação.

CONTEXTO DA QUESTÃO:
{question_context}

RESPOSTA ESPERADA (Gabarito):
{correct_answer}

RESPOSTA DO CANDIDATO:
{user_answer}

Sua tarefa é avaliar a resposta do candidato comparando com a resposta esperada.

Retorne APENAS um JSON válido com a seguinte estrutura:
{{
  "is_correct": boolean,
  "score": number (0-100),
  "confidence": number (0-1),
  "feedback": "string com feedback detalhado",
  "details": ["lista", "de", "pontos", "avaliados"]
}}

CRITÉRIOS DE AVALIAÇÃO:
1. Correção técnica (40 pontos)
2. Completude da resposta (30 pontos)
3. Clareza e organização (20 pontos)
4. Menção de complexidade/performance (10 pontos)

Uma resposta é considerada CORRETA (is_correct: true) se:
- Score >= 70
- Conceitos principais estão corretos
- Não há erros técnicos graves

Seja rigoroso mas justo na avaliação.
"""
        
        # Chamar OpenAI API
        response = openai.ChatCompletion.create(
            model=os.getenv('AI_MODEL', 'gpt-3.5-turbo'),
            messages=[
                {
                    "role": "system",
                    "content": "Você é um avaliador técnico especializado. Sempre retorne apenas JSON válido."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=float(os.getenv('AI_TEMPERATURE', 0.3)),
            max_tokens=int(os.getenv('AI_MAX_TOKENS', 2000))
        )
        
        # Extrair resposta da IA
        ai_response = response.choices[0].message.content.strip()
        
        # Tentar parsear JSON
        import json
        try:
            # Remover markdown code blocks se existirem
            if ai_response.startswith('```json'):
                ai_response = ai_response[7:]
            if ai_response.startswith('```'):
                ai_response = ai_response[3:]
            if ai_response.endswith('```'):
                ai_response = ai_response[:-3]
            
            result = json.loads(ai_response.strip())
            
            # Validar estrutura
            required_fields = ['is_correct', 'score', 'feedback', 'details']
            for field in required_fields:
                if field not in result:
                    raise ValueError(f'Campo {field} ausente na resposta da IA')
            
            # Adicionar confidence se não existir
            if 'confidence' not in result:
                result['confidence'] = 0.85
            
            # Log para debug
            print(f"[VALIDATION SUCCESS] Question {question_id}: Score {result['score']}, Correct: {result['is_correct']}")
            
            return jsonify(result), 200
            
        except json.JSONDecodeError as e:
            print(f"[ERROR] JSON inválido da IA: {ai_response}")
            # Fallback com resposta básica
            return jsonify({
                'is_correct': False,
                'score': 50,
                'confidence': 0.5,
                'feedback': 'Não foi possível avaliar automaticamente. A resposta será revisada manualmente.',
                'details': ['⚠️ Erro na avaliação automática']
            }), 200
            
    except Exception as e:
        print(f"[ERROR] Erro na validação: {str(e)}")
        return jsonify({
            'error': 'Erro interno no serviço de validação',
            'message': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'HabilitaDev AI Validation Service',
        'version': '1.0.0'
    }), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    print(f"🤖 AI Validation Service starting on port {port}...")
    print(f"📊 Model: {os.getenv('AI_MODEL', 'gpt-3.5-turbo')}")
    print(f"🌡️  Temperature: {os.getenv('AI_TEMPERATURE', 0.3)}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
```

---

### **Arquivo: requirements.txt**

```txt
flask==3.0.0
flask-cors==4.0.0
openai==1.3.0
python-dotenv==1.0.0
```

---

### **Arquivo: .env**

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# AI Model Configuration
AI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=2000

# Server Configuration
PORT=5000
DEBUG=true
```

---

### **Como Executar:**

```bash
# Instalar dependências
pip install -r requirements.txt

# Executar serviço
python app.py
```

---

## 🚀 **Exemplo 2: Serviço Node.js com Express + OpenAI**

### **Arquivo: server.js**

```javascript
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint de validação
app.post('/validate', async (req, res) => {
  try {
    const {
      user_answer,
      correct_answer,
      question_context,
      question_id
    } = req.body;

    // Validar dados
    if (!user_answer || !correct_answer) {
      return res.status(400).json({
        error: 'user_answer e correct_answer são obrigatórios'
      });
    }

    // Construir prompt
    const prompt = `
Você é um avaliador técnico especializado em entrevistas de programação.

CONTEXTO DA QUESTÃO:
${question_context}

RESPOSTA ESPERADA (Gabarito):
${correct_answer}

RESPOSTA DO CANDIDATO:
${user_answer}

Sua tarefa é avaliar a resposta do candidato comparando com a resposta esperada.

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "is_correct": boolean,
  "score": number (0-100),
  "confidence": number (0-1),
  "feedback": "string com feedback detalhado",
  "details": ["lista", "de", "pontos", "avaliados"]
}

CRITÉRIOS DE AVALIAÇÃO:
1. Correção técnica (40 pontos)
2. Completude da resposta (30 pontos)
3. Clareza e organização (20 pontos)
4. Menção de complexidade/performance (10 pontos)

Uma resposta é considerada CORRETA (is_correct: true) se:
- Score >= 70
- Conceitos principais estão corretos
- Não há erros técnicos graves

Seja rigoroso mas justo na avaliação.
`;

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um avaliador técnico especializado. Sempre retorne apenas JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: parseFloat(process.env.AI_TEMPERATURE || 0.3),
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || 2000)
    });

    // Extrair resposta
    let aiResponse = completion.choices[0].message.content.trim();

    // Limpar markdown
    if (aiResponse.startsWith('```json')) {
      aiResponse = aiResponse.slice(7);
    }
    if (aiResponse.startsWith('```')) {
      aiResponse = aiResponse.slice(3);
    }
    if (aiResponse.endsWith('```')) {
      aiResponse = aiResponse.slice(0, -3);
    }

    // Parsear JSON
    const result = JSON.parse(aiResponse.trim());

    // Validar campos obrigatórios
    const requiredFields = ['is_correct', 'score', 'feedback', 'details'];
    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`Campo ${field} ausente na resposta da IA`);
      }
    }

    // Adicionar confidence se não existir
    if (!result.confidence) {
      result.confidence = 0.85;
    }

    console.log(`[VALIDATION SUCCESS] Question ${question_id}: Score ${result.score}, Correct: ${result.is_correct}`);

    res.json(result);

  } catch (error) {
    console.error('[ERROR] Erro na validação:', error);
    
    // Fallback
    res.json({
      is_correct: false,
      score: 50,
      confidence: 0.5,
      feedback: 'Não foi possível avaliar automaticamente. A resposta será revisada manualmente.',
      details: ['⚠️ Erro na avaliação automática']
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HabilitaDev AI Validation Service',
    version: '1.0.0'
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🤖 AI Validation Service starting on port ${port}...`);
  console.log(`📊 Model: ${process.env.AI_MODEL || 'gpt-3.5-turbo'}`);
  console.log(`🌡️  Temperature: ${process.env.AI_TEMPERATURE || 0.3}`);
});
```

---

### **Arquivo: package.json**

```json
{
  "name": "habilitadev-ai-service",
  "version": "1.0.0",
  "description": "Serviço de validação de respostas por IA para HabilitaDev",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "openai": "^4.20.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

### **Como Executar:**

```bash
# Instalar dependências
npm install

# Executar serviço
npm start

# Ou com nodemon (desenvolvimento)
npm run dev
```

---

## 🐳 **Exemplo 3: Dockerfile para Deploy**

### **Dockerfile (Python)**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY app.py .

# Expor porta
EXPOSE 5000

# Variáveis de ambiente
ENV PORT=5000
ENV DEBUG=false

# Comando de inicialização
CMD ["python", "app.py"]
```

---

### **Dockerfile (Node.js)**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY server.js .

# Expor porta
EXPOSE 5000

# Variáveis de ambiente
ENV PORT=5000
ENV DEBUG=false

# Comando de inicialização
CMD ["node", "server.js"]
```

---

## ☁️ **Deploy em Plataformas**

### **Railway**

1. Criar novo projeto no Railway
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente:
   - `OPENAI_API_KEY`
   - `AI_MODEL`
   - `AI_TEMPERATURE`
   - `PORT`
4. Deploy automático

### **Render**

1. Criar novo Web Service
2. Conectar repositório
3. Configurar:
   - Build Command: `pip install -r requirements.txt` ou `npm install`
   - Start Command: `python app.py` ou `npm start`
4. Adicionar variáveis de ambiente
5. Deploy

### **Heroku**

```bash
# Login
heroku login

# Criar app
heroku create habilitadev-ai

# Configurar variáveis
heroku config:set OPENAI_API_KEY=your-key
heroku config:set AI_MODEL=gpt-3.5-turbo

# Deploy
git push heroku main
```

---

## 🧪 **Testar o Serviço**

### **Teste com cURL:**

```bash
curl -X POST http://localhost:5000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "user_answer": "O quicksort tem complexidade O(n log n) no caso médio e O(n²) no pior caso. É um algoritmo de divisão e conquista que escolhe um pivô e particiona o array.",
    "correct_answer": "O quicksort tem complexidade O(n log n) no caso médio e O(n²) no pior caso. É um algoritmo de divisão e conquista que escolhe um pivô e particiona o array.",
    "question_context": "Implementar algoritmo de ordenação eficiente",
    "question_id": "1"
  }'
```

### **Resposta Esperada:**

```json
{
  "is_correct": true,
  "score": 95,
  "confidence": 0.95,
  "feedback": "Excelente resposta! Você demonstrou compreensão completa do algoritmo Quicksort, incluindo sua complexidade temporal em diferentes cenários e o conceito de divisão e conquista.",
  "details": [
    "✅ Algoritmo correto identificado (Quicksort)",
    "✅ Complexidade O(n log n) mencionada corretamente",
    "✅ Pior caso O(n²) identificado",
    "✅ Conceito de divisão e conquista explicado",
    "✅ Menção ao pivô e particionamento do array"
  ]
}
```

---

## 📚 **Recursos Adicionais**

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Railway Deployment Guide](https://docs.railway.app/)
- [Render Deployment Guide](https://render.com/docs)

---

## 💡 **Dicas**

1. **Custos:** Use `gpt-3.5-turbo` para economia, ou `gpt-4` para maior precisão
2. **Rate Limiting:** Implemente limite de requisições para evitar abusos
3. **Cache:** Cachear respostas idênticas para economizar tokens
4. **Monitoramento:** Use ferramentas como Sentry ou LogTail
5. **Backup:** Sempre tenha fallback local funcionando

---

**Desenvolvido para o HabilitaDev**

