import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://habilitadev-backend.onrender.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const url = `${BACKEND_URL}/api/v1/questions${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // Timeout de 30 segundos
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      // Se o backend estiver em manutenção ou com erro 500, retornar dados mockados
      if (response.status === 503 || response.status === 502 || response.status === 500) {
        console.log('Backend indisponível, retornando dados mockados');
        return NextResponse.json({
          success: true,
          data: getMockQuestions(),
          message: 'Dados de demonstração - Backend temporariamente indisponível'
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }
      
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    console.log('Erro na conexão com backend, retornando dados mockados');
    
    // Em caso de erro de conexão, retornar dados mockados
    return NextResponse.json({
      success: true,
      data: getMockQuestions(),
      message: 'Dados de demonstração - Backend temporariamente indisponível'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

// Função para gerar dados mockados
function getMockQuestions() {
  return [
    {
      id: 1,
      title: "Implementar algoritmo de ordenação",
      description: "Implemente um algoritmo de ordenação eficiente (quicksort, mergesort ou heapsort) e explique sua complexidade temporal.",
      answer: "O quicksort tem complexidade O(n log n) no caso médio e O(n²) no pior caso. É um algoritmo de divisão e conquista que escolhe um pivô e particiona o array.",
      difficulty: "medium" as const,
      category: "algorithms" as const,
      company: "Google",
      tags: ["algoritmos", "ordenação", "complexidade"],
      created_at: "2024-01-15T10:00:00Z",
      approved: true
    },
    {
      id: 2,
      title: "Estrutura de dados para cache LRU",
      description: "Como você implementaria um cache LRU (Least Recently Used) eficiente? Descreva a estrutura de dados utilizada.",
      answer: "Um cache LRU pode ser implementado usando uma combinação de HashMap (para acesso O(1)) e Doubly Linked List (para manter ordem de uso).",
      difficulty: "hard" as const,
      category: "data_structures" as const,
      company: "Amazon",
      tags: ["cache", "LRU", "hashmap", "linked-list"],
      created_at: "2024-01-14T15:30:00Z",
      approved: true
    },
    {
      id: 3,
      title: "Design de sistema de microserviços",
      description: "Descreva como você projetaria um sistema de microserviços para uma aplicação de e-commerce com alta disponibilidade.",
      answer: "O sistema seria composto por serviços independentes: usuários, produtos, pedidos, pagamentos, notificações. Cada serviço teria seu próprio banco de dados e comunicação via API REST ou message queues.",
      difficulty: "hard" as const,
      category: "system_design" as const,
      company: "Netflix",
      tags: ["microserviços", "arquitetura", "escalabilidade"],
      created_at: "2024-01-13T09:15:00Z",
      approved: true
    },
    {
      id: 4,
      title: "Otimização de query SQL",
      description: "Dada uma tabela com milhões de registros, como você otimizaria uma query que busca por usuários ativos nos últimos 30 dias?",
      answer: "Criaria índices compostos na coluna de data e status do usuário, usaria paginação, e consideraria particionamento da tabela por data.",
      difficulty: "medium" as const,
      category: "databases" as const,
      company: "Meta",
      tags: ["SQL", "otimização", "índices", "performance"],
      created_at: "2024-01-12T14:20:00Z",
      approved: true
    },
    {
      id: 5,
      title: "Implementar React Hook personalizado",
      description: "Crie um React Hook personalizado para gerenciar estado de formulário com validação em tempo real.",
      answer: "O hook useForm retornaria valores, erros, handlers e funções de validação. Usaria useState para estado e useEffect para validação em tempo real.",
      difficulty: "easy" as const,
      category: "frontend" as const,
      company: "Shopify",
      tags: ["React", "hooks", "formulários", "validação"],
      created_at: "2024-01-11T11:45:00Z",
      approved: true
    }
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/v1/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // Timeout de 30 segundos
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create question'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
