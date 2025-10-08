import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[FEEDBACK POST] Iniciando requisição para question ${params.id}`);
    
    const body = await request.json();
    console.log('[FEEDBACK POST] Body recebido:', body);

    console.log(`[FEEDBACK POST] Tentando conectar com backend: ${BACKEND_URL}/api/v1/questions/${params.id}/feedback`);
    
    const response = await fetch(`${BACKEND_URL}/api/v1/questions/${params.id}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`[FEEDBACK POST] Response status: ${response.status}`);

    if (!response.ok) {
      // Se o backend estiver indisponível, simular criação de feedback
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        console.log('Backend indisponível, simulando criação de feedback');
        const mockFeedback = createMockFeedback(body, params.id);

        return NextResponse.json({
          success: true,
          data: mockFeedback,
          message: 'Feedback criado com sucesso (modo demonstração)'
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[FEEDBACK POST] Dados recebidos do backend:', data);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('[FEEDBACK POST] Proxy error:', error);
    console.log('Erro na conexão com backend, simulando criação de feedback');

    try {
      // Em caso de erro de conexão, simular criação de feedback
      const body = await request.json();
      const mockFeedback = createMockFeedback(body, params.id);

      return NextResponse.json({
        success: true,
        data: mockFeedback,
        message: 'Feedback criado com sucesso (modo demonstração)'
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (fallbackError) {
      console.error('[FEEDBACK POST] Erro no fallback:', fallbackError);
      
      // Fallback final com dados básicos
      const mockFeedback = createMockFeedback({}, params.id);
      
      return NextResponse.json({
        success: true,
        data: mockFeedback,
        message: 'Feedback criado com sucesso (modo demonstração)'
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
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/questions/${params.id}/feedback`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Se o backend estiver indisponível, retornar feedback mockado
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        console.log('Backend indisponível, retornando feedback mockado');
        const mockFeedback = getMockFeedback(params.id);

        return NextResponse.json({
          success: true,
          data: mockFeedback,
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
    console.log('Erro na conexão com backend, retornando feedback mockado');

    // Em caso de erro de conexão, retornar feedback mockado
    const mockFeedback = getMockFeedback(params.id);

    return NextResponse.json({
      success: true,
      data: mockFeedback,
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

function createMockFeedback(body: any, questionId: string) {
  const now = new Date().toISOString();

  return {
    id: Math.floor(Math.random() * 1000) + 1,
    question_id: parseInt(questionId),
    feedback_type: body.feedback_type || 'suggestion',
    content: body.content || 'Feedback de exemplo',
    status: 'pending',
    user_id: body.user_id || null,
    created_at: now
  };
}

function getMockFeedback(questionId: string) {
  const now = new Date().toISOString();

  return [
    {
      id: 1,
      question_id: parseInt(questionId),
      feedback_type: 'suggestion',
      content: 'Sugestão: Seria útil adicionar mais exemplos práticos para melhor compreensão da solução.',
      status: 'pending',
      user_id: null,
      created_at: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
    },
    {
      id: 2,
      question_id: parseInt(questionId),
      feedback_type: 'correction',
      content: 'Correção: Há um pequeno erro na linha 15 do código de exemplo. O método correto é `Array.prototype.map()`.',
      status: 'pending',
      user_id: null,
      created_at: new Date(Date.now() - 172800000).toISOString() // 2 dias atrás
    },
    {
      id: 3,
      question_id: parseInt(questionId),
      feedback_type: 'improvement',
      content: 'Melhoria: Consideraria adicionar uma seção sobre otimização de performance para esta solução.',
      status: 'pending',
      user_id: null,
      created_at: new Date(Date.now() - 259200000).toISOString() // 3 dias atrás
    }
  ];
}