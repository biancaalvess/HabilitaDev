import { Question, Answer, Comment, Feedback } from './types';

// Dados mock para fallback quando backend estiver offline
export const mockQuestions: Question[] = [
  {
    id: 1,
    title: "Implementar algoritmo de ordenação",
    description: "Implemente um algoritmo de ordenação eficiente (quicksort, mergesort ou heapsort) e explique sua complexidade de tempo e espaço.",
    answer: "Aqui está uma implementação do quicksort:\n\n```python\ndef quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    \n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    \n    return quicksort(left) + middle + quicksort(right)\n```\n\n**Complexidade:**\n- Tempo: O(n log n) no caso médio, O(n²) no pior caso\n- Espaço: O(log n) devido à recursão",
    difficulty: "medium",
    category: "algorithms",
    company: "Google",
    tags: ["sorting", "algorithms", "recursion"],
    created_at: "2024-01-15T10:00:00Z",
    approved: true,
  },
  {
    id: 2,
    title: "Design de sistema de chat em tempo real",
    description: "Como você projetaria um sistema de chat em tempo real que suporte milhões de usuários simultâneos? Considere escalabilidade, latência e consistência.",
    answer: "**Arquitetura proposta:**\n\n1. **Load Balancer** - Distribui conexões entre servidores\n2. **WebSocket Servers** - Gerenciam conexões persistentes\n3. **Message Queue** (Redis/RabbitMQ) - Para distribuição de mensagens\n4. **Database** (PostgreSQL) - Armazena histórico de mensagens\n5. **Cache** (Redis) - Para sessões ativas e mensagens recentes\n\n**Considerações:**\n- Sharding por usuário para distribuir carga\n- CDN para arquivos de mídia\n- Compressão de mensagens\n- Rate limiting para prevenir spam",
    difficulty: "hard",
    category: "system_design",
    company: "Meta",
    tags: ["websockets", "scalability", "real-time"],
    created_at: "2024-01-14T15:30:00Z",
    approved: true,
  },
  {
    id: 3,
    title: "Otimizar consulta SQL complexa",
    description: "Dada uma tabela de vendas com milhões de registros, como você otimizaria uma consulta que busca o top 10 produtos mais vendidos por categoria no último mês?",
    answer: "**Estratégias de otimização:**\n\n1. **Índices apropriados:**\n```sql\nCREATE INDEX idx_sales_category_date ON sales(category, sale_date);\nCREATE INDEX idx_sales_product_quantity ON sales(product_id, quantity);\n```\n\n2. **Consulta otimizada:**\n```sql\nSELECT category, product_id, SUM(quantity) as total_sold\nFROM sales \nWHERE sale_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)\nGROUP BY category, product_id\nORDER BY category, total_sold DESC\nLIMIT 10;\n```\n\n3. **Considerações adicionais:**\n- Particionamento por data\n- Materialized views para agregações\n- Cache de resultados frequentes",
    difficulty: "medium",
    category: "databases",
    company: "Amazon",
    tags: ["sql", "optimization", "indexing"],
    created_at: "2024-01-13T09:15:00Z",
    approved: true,
  },
  {
    id: 4,
    title: "Implementar debounce em React",
    description: "Implemente um hook personalizado de debounce em React que possa ser usado para otimizar pesquisas em tempo real.",
    answer: "```typescript\nimport { useState, useEffect } from 'react';\n\nfunction useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => {\n      clearTimeout(handler);\n    };\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n\n// Uso:\nfunction SearchComponent() {\n  const [searchTerm, setSearchTerm] = useState('');\n  const debouncedSearchTerm = useDebounce(searchTerm, 500);\n\n  useEffect(() => {\n    if (debouncedSearchTerm) {\n      // Fazer busca na API\n      performSearch(debouncedSearchTerm);\n    }\n  }, [debouncedSearchTerm]);\n\n  return (\n    <input\n      type=\"text\"\n      value={searchTerm}\n      onChange={(e) => setSearchTerm(e.target.value)}\n      placeholder=\"Pesquisar...\"\n    />\n  );\n}\n```",
    difficulty: "easy",
    category: "frontend",
    company: "Netflix",
    tags: ["react", "hooks", "optimization"],
    created_at: "2024-01-12T14:20:00Z",
    approved: true,
  },
  {
    id: 5,
    title: "Configurar CI/CD pipeline",
    description: "Descreva como você configuraria um pipeline de CI/CD para uma aplicação Node.js com testes automatizados, análise de código e deploy automático.",
    answer: "**Pipeline CI/CD com GitHub Actions:**\n\n```yaml\nname: CI/CD Pipeline\n\non:\n  push:\n    branches: [main, develop]\n  pull_request:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - uses: actions/setup-node@v3\n        with:\n          node-version: '18'\n      - run: npm ci\n      - run: npm run test\n      - run: npm run lint\n      - run: npm run build\n\n  security:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm audit\n      - run: npx snyk test\n\n  deploy:\n    needs: [test, security]\n    runs-on: ubuntu-latest\n    if: github.ref == 'refs/heads/main'\n    steps:\n      - name: Deploy to production\n        run: echo \"Deploying to production...\"\n```\n\n**Ferramentas recomendadas:**\n- Jest para testes\n- ESLint para linting\n- Snyk para segurança\n- Docker para containerização",
    difficulty: "medium",
    category: "devops",
    company: "Microsoft",
    tags: ["ci-cd", "github-actions", "automation"],
    created_at: "2024-01-11T11:45:00Z",
    approved: true,
  },
];

export const mockAnswers: Answer[] = [
  {
    id: 1,
    question_id: 1,
    author_name: "João Silva",
    content: "Excelente implementação! Gostaria de adicionar que o quicksort é in-place, o que o torna mais eficiente em termos de memória que o mergesort.",
    created_at: "2024-01-15T11:30:00Z",
    is_solution: false,
  },
  {
    id: 2,
    question_id: 1,
    author_name: "Maria Santos",
    content: "Aqui está uma versão iterativa do quicksort que evita estouro de pilha:\n\n```python\ndef quicksort_iterative(arr):\n    stack = [(0, len(arr) - 1)]\n    \n    while stack:\n        low, high = stack.pop()\n        if low < high:\n            pivot = partition(arr, low, high)\n            stack.append((low, pivot - 1))\n            stack.append((pivot + 1, high))\n```",
    created_at: "2024-01-15T12:15:00Z",
    is_solution: true,
  },
];

export const mockComments: Comment[] = [
  {
    id: 1,
    question_id: 1,
    author_name: "Pedro Costa",
    comment_type: "suggestion",
    content: "Sugiro adicionar exemplos de quando usar cada algoritmo de ordenação para diferentes cenários.",
    created_at: "2024-01-15T13:00:00Z",
  },
  {
    id: 2,
    question_id: 2,
    author_name: "Ana Lima",
    comment_type: "correction",
    content: "Na arquitetura proposta, faltou mencionar o uso de WebRTC para comunicação peer-to-peer quando possível.",
    created_at: "2024-01-14T16:45:00Z",
  },
];

export const mockFeedback: Feedback[] = [
  {
    id: 1,
    question_id: 1,
    user_id: 1,
    feedback_type: "improvement",
    content: "A questão está muito boa, mas seria interessante adicionar exercícios práticos para fixar o aprendizado.",
    status: "pending",
    created_at: "2024-01-15T14:20:00Z",
  },
  {
    id: 2,
    question_id: 2,
    user_id: 2,
    feedback_type: "suggestion",
    content: "Sugestão: incluir diagramas da arquitetura para facilitar o entendimento visual.",
    status: "reviewed",
    created_at: "2024-01-14T17:30:00Z",
  },
];

// Função para verificar se estamos em modo offline
export function isOfflineMode(): boolean {
  return typeof window !== 'undefined' && !navigator.onLine;
}

// Função para simular delay de rede
export function simulateNetworkDelay(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
