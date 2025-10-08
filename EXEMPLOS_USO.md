# 💡 Exemplos de Uso - HabilitaDev

## 📚 Guia Completo de Implementação

---

## 1️⃣ **Hook useQuestionVerification**

### **Uso Básico**

```tsx
import { useQuestionVerification } from '@/hooks/use-question-verification';

export function QuestionComponent() {
  const { loading, result, error, verifyAnswer } = useQuestionVerification();

  const handleVerify = async () => {
    try {
      const validationResult = await verifyAnswer(
        1,  // questionId
        "O quicksort tem complexidade O(n log n)", // userAnswer
        "Resposta oficial", // correctAnswer
        "Questão sobre algoritmos" // questionContext (opcional)
      );

      console.log('Validação:', validationResult);
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return (
    <div>
      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verificando...' : 'Verificar Resposta'}
      </button>
      
      {error && <p className="text-red-500">Erro: {error}</p>}
      
      {result && (
        <div>
          <p>Score: {result.score}/100</p>
          <p>Correto: {result.is_correct ? 'Sim' : 'Não'}</p>
          <p>Feedback: {result.feedback}</p>
        </div>
      )}
    </div>
  );
}
```

### **Com Configuração Personalizada**

```tsx
const { verifyAnswer } = useQuestionVerification({
  maxRetries: 5,      // Tentar 5 vezes
  retryDelay: 2000    // Começar com 2s de delay
});

// Retry com delays: 2s, 4s, 8s, 16s, 32s (exponential backoff)
```

---

## 2️⃣ **Sistema de Toast Notifications**

### **Setup no Layout Principal**

```tsx
// app/layout.tsx ou componente raiz
"use client";

import { useToastNotification } from '@/hooks/use-toast-notification';
import ToastContainer from '@/components/ui/toast-container';

export default function RootLayout({ children }) {
  const toast = useToastNotification();

  return (
    <html>
      <body>
        {children}
        
        <ToastContainer
          toasts={toast.toasts}
          onClose={toast.close}
          position="top-right"
        />
      </body>
    </html>
  );
}
```

### **Uso em Componentes**

```tsx
import { useToastNotification } from '@/hooks/use-toast-notification';

export function MyComponent() {
  const toast = useToastNotification();

  // Sucesso
  const handleSuccess = () => {
    toast.success('Resposta validada com sucesso!', 3000);
  };

  // Erro
  const handleError = () => {
    toast.error('Falha na validação', 5000);
  };

  // Warning
  const handleWarning = () => {
    toast.warning('Atenção: Limite de tentativas atingido');
  };

  // Info
  const handleInfo = () => {
    toast.info('Validação em andamento...');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Mostrar Sucesso</button>
      <button onClick={handleError}>Mostrar Erro</button>
      <button onClick={handleWarning}>Mostrar Aviso</button>
      <button onClick={handleInfo}>Mostrar Info</button>
    </div>
  );
}
```

---

## 3️⃣ **Rate Limiting**

### **Controle de Submissões**

```tsx
import { answerSubmitLimiter } from '@/lib/rate-limiter';
import { useToastNotification } from '@/hooks/use-toast-notification';

export function AnswerForm() {
  const toast = useToastNotification();

  const handleSubmit = async (answer: string) => {
    // Verificar se pode fazer a requisição
    if (!answerSubmitLimiter.canMakeRequest()) {
      const timeRemaining = answerSubmitLimiter.getTimeUntilNextRequest();
      const seconds = Math.ceil(timeRemaining / 1000);
      
      toast.warning(
        `Aguarde ${seconds} segundos antes de enviar outra resposta`,
        5000
      );
      return;
    }

    // Mostrar quantas requisições restam
    const remaining = answerSubmitLimiter.getRemainingRequests();
    console.log(`Você pode fazer mais ${remaining} requisições`);

    // Prosseguir com a submissão
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ answer })
      });

      toast.success('Resposta enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    }
  };

  return (
    <button onClick={() => handleSubmit('Minha resposta')}>
      Enviar Resposta
    </button>
  );
}
```

### **Rate Limiter Personalizado**

```tsx
import { RateLimiter } from '@/lib/rate-limiter';

// Criar rate limiter específico
const commentLimiter = new RateLimiter(10, 60000); // 10 por minuto

function submitComment(comment: string) {
  if (!commentLimiter.canMakeRequest()) {
    alert('Você atingiu o limite de comentários por minuto');
    return;
  }

  // Enviar comentário
  fetch('/api/comments', { ... });
}
```

---

## 4️⃣ **Sanitização de Input**

### **Sanitização Básica**

```tsx
import { sanitizeInput, sanitizeAnswer } from '@/lib/input-sanitizer';

export function InputField() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (input: string) => {
    // Sanitizar input básico
    const clean = sanitizeInput(input);
    setValue(clean);
  };

  const handleSubmit = () => {
    // Sanitizar e validar resposta completa
    const { sanitized, valid, errors } = sanitizeAnswer(value);

    if (!valid) {
      setError(errors.join(', '));
      return;
    }

    // Usar valor sanitizado
    submitAnswer(sanitized);
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Digite sua resposta..."
      />
      
      {error && <p className="text-red-500">{error}</p>}
      
      <button onClick={handleSubmit}>Enviar</button>
    </div>
  );
}
```

### **Validação de Comprimento**

```tsx
import { validateLength } from '@/lib/input-sanitizer';

function validateInput(text: string) {
  const validation = validateLength(text, 10, 1000);

  if (!validation.valid) {
    console.error(validation.error);
    return false;
  }

  return true;
}
```

### **Proteção Contra XSS**

```tsx
import { isSafeInput, sanitizeHTML } from '@/lib/input-sanitizer';

function handleUserInput(input: string) {
  // Verificar se é seguro
  if (!isSafeInput(input)) {
    alert('Input contém conteúdo não permitido');
    return;
  }

  // Permitir apenas tags seguras
  const safeHTML = sanitizeHTML(input, ['b', 'i', 'code']);
  
  setContent(safeHTML);
}
```

---

## 5️⃣ **Componente Completo - Exemplo Real**

### **Formulário de Resposta com Todas as Melhorias**

```tsx
"use client";

import { useState } from 'react';
import { useQuestionVerification } from '@/hooks/use-question-verification';
import { useToastNotification } from '@/hooks/use-toast-notification';
import { answerSubmitLimiter } from '@/lib/rate-limiter';
import { sanitizeAnswer } from '@/lib/input-sanitizer';
import ToastContainer from '@/components/ui/toast-container';

interface AnswerFormProps {
  questionId: number;
  correctAnswer: string;
  questionContext: string;
}

export function AdvancedAnswerForm({ 
  questionId, 
  correctAnswer, 
  questionContext 
}: AnswerFormProps) {
  const [answer, setAnswer] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  
  const { loading, result, error, verifyAnswer, reset } = useQuestionVerification({
    maxRetries: 3,
    retryDelay: 1000
  });
  
  const toast = useToastNotification();

  const handleInputChange = (value: string) => {
    // Sanitizar e validar em tempo real
    const { sanitized, valid, errors: validationErrors } = sanitizeAnswer(value);
    
    setAnswer(sanitized);
    setErrors(validationErrors);
  };

  const handleSubmit = async () => {
    // 1. Verificar rate limiting
    if (!answerSubmitLimiter.canMakeRequest()) {
      const timeRemaining = answerSubmitLimiter.getTimeUntilNextRequest();
      const seconds = Math.ceil(timeRemaining / 1000);
      
      toast.warning(
        `Aguarde ${seconds} segundos antes de enviar outra resposta`,
        5000
      );
      return;
    }

    // 2. Validar input
    const { sanitized, valid, errors: validationErrors } = sanitizeAnswer(answer);
    
    if (!valid) {
      validationErrors.forEach(err => toast.error(err, 5000));
      return;
    }

    // 3. Enviar para verificação
    try {
      toast.info('🤖 IA analisando sua resposta...', 3000);

      const validation = await verifyAnswer(
        questionId,
        sanitized,
        correctAnswer,
        questionContext
      );

      // 4. Mostrar resultado
      if (validation.is_correct) {
        toast.success(
          `✅ Resposta Correta! Score: ${validation.score}/100`,
          5000
        );
      } else {
        toast.error(
          `❌ Resposta Incorreta. Score: ${validation.score}/100`,
          5000
        );
      }
    } catch (err) {
      toast.error(
        'Erro ao verificar resposta. Por favor, tente novamente.',
        5000
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Textarea com validação em tempo real */}
      <div>
        <label htmlFor="answer" className="block text-sm font-medium mb-2">
          Sua Resposta
        </label>
        
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Digite sua resposta aqui..."
          rows={10}
          className={`
            w-full p-4 border rounded-lg
            ${errors.length > 0 ? 'border-red-500' : 'border-gray-300'}
          `}
          disabled={loading}
        />
        
        {/* Mostrar erros de validação */}
        {errors.length > 0 && (
          <div className="mt-2 text-sm text-red-500">
            {errors.map((err, index) => (
              <p key={index}>• {err}</p>
            ))}
          </div>
        )}
        
        {/* Contador de caracteres */}
        <p className="mt-1 text-sm text-gray-500">
          {answer.length}/5000 caracteres
        </p>
      </div>

      {/* Botão de submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || answer.trim().length < 10}
        className={`
          px-6 py-3 rounded-lg font-medium
          ${loading || answer.trim().length < 10
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Verificando...
          </>
        ) : (
          'Verificar Resposta'
        )}
      </button>

      {/* Resultado da validação */}
      {result && (
        <div className={`
          p-4 rounded-lg border-l-4
          ${result.is_correct 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
          }
        `}>
          <h3 className="font-bold mb-2">
            {result.is_correct ? '✅ Correto!' : '❌ Incorreto'}
          </h3>
          
          <p className="mb-2">
            <strong>Score:</strong> {result.score}/100
          </p>
          
          <p className="mb-2">
            <strong>Feedback:</strong> {result.feedback}
          </p>
          
          {result.details && result.details.length > 0 && (
            <div className="mt-3">
              <strong>Detalhes:</strong>
              <ul className="list-disc list-inside mt-1">
                {result.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={reset}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Container de Toasts */}
      <ToastContainer
        toasts={toast.toasts}
        onClose={toast.close}
        position="top-right"
      />
    </div>
  );
}
```

---

## 🎯 **Resumo das Melhores Práticas**

### ✅ **Sempre Fazer:**
1. Sanitizar TODOS os inputs do usuário
2. Verificar rate limiting antes de fazer requisições
3. Usar retry logic para requisições críticas
4. Mostrar feedback visual para o usuário (toasts)
5. Validar inputs em tempo real
6. Desabilitar botões durante loading
7. Mostrar contadores de caracteres
8. Tratar todos os erros possíveis

### ❌ **Nunca Fazer:**
1. Confiar em inputs sem sanitizar
2. Fazer requisições ilimitadas
3. Deixar usuário sem feedback
4. Permitir envio de formulários vazios
5. Ignorar erros de validação
6. Permitir HTML não sanitizado
7. Submeter sem verificar rate limit

---

**🚀 Com essas implementações, o HabilitaDev está robusto e pronto para produção!**

