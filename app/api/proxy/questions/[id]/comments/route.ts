import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://habilitadev-backend.onrender.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/questions/${params.id}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Se o backend estiver indisponível, retornar comentários mockados
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        console.log('Backend indisponível, retornando comentários mockados');
        const mockComments = getMockComments(params.id);
        
        return NextResponse.json({
          success: true,
          data: mockComments,
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
    console.log('Erro na conexão com backend, retornando comentários mockados');
    
    // Em caso de erro de conexão, retornar comentários mockados
    const mockComments = getMockComments(params.id);
    
    return NextResponse.json({
      success: true,
      data: mockComments,
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

// Função para gerar comentários mockados
function getMockComments(questionId: string) {
  const now = new Date().toISOString();
  
  return [
    {
      id: 1,
      question_id: parseInt(questionId),
      author_name: "Ana Costa",
      comment_type: "suggestion",
      content: "Sugestão: A questão poderia incluir mais exemplos práticos para facilitar o entendimento.",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    },
    {
      id: 2,
      question_id: parseInt(questionId),
      author_name: "Carlos Mendes",
      comment_type: "correction",
      content: "Correção: Na linha 15, o método deveria ser 'toLowerCase()' em vez de 'toUpper()'.",
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
    }
  ];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/v1/questions/${params.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Se o backend estiver indisponível, simular criação de comentário
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        console.log('Backend indisponível, simulando criação de comentário');
        const mockComment = createMockComment(body, params.id);
        
        return NextResponse.json({
          success: true,
          data: mockComment,
          message: 'Comentário criado com sucesso (modo demonstração)'
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
    console.log('Erro na conexão com backend, simulando criação de comentário');
    
    // Em caso de erro de conexão, simular criação de comentário
    const body = await request.json();
    const mockComment = createMockComment(body, params.id);
    
    return NextResponse.json({
      success: true,
      data: mockComment,
      message: 'Comentário criado com sucesso (modo demonstração)'
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

// Função para criar comentário mockado
function createMockComment(body: any, questionId: string) {
  const now = new Date().toISOString();
  
  return {
    id: Math.floor(Math.random() * 1000) + 1,
    question_id: parseInt(questionId),
    author_name: body.author_name || 'Usuário',
    comment_type: body.comment_type || 'suggestion',
    content: body.content || 'Comentário de exemplo',
    created_at: now
  };
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
