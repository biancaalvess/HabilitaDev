import { NextRequest, NextResponse } from 'next/server';
import type { Question } from '@/lib/types';

// Simulando um banco de dados em memória (em produção, use um banco real)
let questions: Question[] = [
  {
    id: 1,
    title: "Implementar Binary Search",
    description: "Implemente uma função de busca binária em uma lista ordenada. A função deve retornar o índice do elemento procurado ou -1 se não encontrado.",
    answer: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
    difficulty: "medium",
    category: "algorithms",
    company: "Itaú",
    tags: ["busca", "algoritmos", "python"],
    created_at: "2024-01-15T10:00:00Z",
    approved: true,
  },
  {
    id: 2,
    title: "Design de Sistema - Cache Distribuído",
    description: "Como você projetaria um sistema de cache distribuído como o Redis? Considere aspectos como sharding, replicação, consistência e tolerância a falhas.",
    answer: `Componentes principais:
1. **Sharding**: Distribuir dados usando hash consistente
2. **Replicação**: Master-slave para alta disponibilidade
3. **Consistência**: Eventual consistency com conflict resolution
4. **Monitoramento**: Health checks e métricas
5. **Protocolo**: TCP com serialização eficiente (Protocol Buffers)`,
    difficulty: "hard",
    category: "system_design",
    company: "Meta",
    tags: ["cache", "distribuído", "arquitetura"],
    created_at: "2024-01-14T15:30:00Z",
    approved: true,
  },
  {
    id: 3,
    title: "Otimização de Query SQL",
    description: "Dada uma query SQL lenta que busca usuários com mais de 100 pedidos no último mês, como você otimizaria a performance?",
    answer: `Estratégias de otimização:
1. **Índices**: Criar índice composto em (user_id, created_at)
2. **Particionamento**: Particionar tabela de pedidos por data
3. **Query rewrite**: Usar EXISTS ao invés de COUNT
4. **Materialização**: View materializada para agregações
5. **Caching**: Cache de resultados frequentes`,
    difficulty: "medium",
    category: "databases",
    company: "X (Twitter)",
    tags: ["sql", "performance", "índices"],
    created_at: "2024-01-13T09:15:00Z",
    approved: true,
  },
  {
    id: 4,
    title: "Implementar Debounce Hook",
    description: "Crie um hook React customizado que implemente debounce para otimizar chamadas de API em campos de busca.",
    answer: `import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
    difficulty: "easy",
    category: "frontend",
    company: "Nubank",
    tags: ["react", "hooks", "performance"],
    created_at: "2024-01-12T14:20:00Z",
    approved: true,
  },
  {
    id: 5,
    title: "Microserviços - Circuit Breaker",
    description: "Implemente um padrão Circuit Breaker para proteger microserviços de falhas em cascata.",
    answer: `class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.nextAttempt = Date.now();
  }

  async call(service) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await service();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}`,
    difficulty: "hard",
    category: "backend",
    company: "Stone",
    tags: ["microserviços", "resilência", "padrões"],
    created_at: "2024-01-11T11:45:00Z",
    approved: true,
  },
  {
    id: 6,
    title: "Kubernetes Deployment Strategy",
    description: "Explique as diferentes estratégias de deployment no Kubernetes e quando usar cada uma.",
    answer: `Estratégias principais:

1. **Rolling Update** (padrão)
   - Substitui pods gradualmente
   - Zero downtime
   - Rollback automático

2. **Blue-Green**
   - Dois ambientes idênticos
   - Switch instantâneo
   - Requer 2x recursos

3. **Canary**
   - Deploy gradual por percentual
   - Teste com tráfego real
   - Reduz riscos

4. **Recreate**
   - Para aplicações stateful
   - Downtime necessário`,
    difficulty: "medium",
    category: "devops",
    company: "iFood",
    tags: ["kubernetes", "deployment", "devops"],
    created_at: "2024-01-10T16:30:00Z",
    approved: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredQuestions = [...questions];

    // Aplicar filtros
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }

    if (category) {
      filteredQuestions = filteredQuestions.filter(q => q.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredQuestions = filteredQuestions.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.description.toLowerCase().includes(searchLower) ||
        q.company?.toLowerCase().includes(searchLower) ||
        q.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Aplicar paginação
    const paginatedQuestions = filteredQuestions.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedQuestions,
      total: filteredQuestions.length,
      offset,
      limit,
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
