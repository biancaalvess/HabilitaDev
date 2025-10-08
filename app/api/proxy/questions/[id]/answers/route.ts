import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://habilitadev-backend.onrender.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/questions/${params.id}/answers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Se o backend estiver indisponível, retornar respostas mockadas
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        console.log('Backend indisponível, retornando respostas mockadas');
        const mockAnswers = getMockAnswers(params.id);
        
        return NextResponse.json({
          success: true,
          data: mockAnswers,
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
    console.log('Erro na conexão com backend, retornando respostas mockadas');
    
    // Em caso de erro de conexão, retornar respostas mockadas
    const mockAnswers = getMockAnswers(params.id);
    
    return NextResponse.json({
      success: true,
      data: mockAnswers,
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

// Função para gerar respostas mockadas
function getMockAnswers(questionId: string) {
  const now = new Date().toISOString();
  
  return [
    {
      id: 1,
      question_id: parseInt(questionId),
      author_name: "João Silva",
      content: "Esta é uma resposta de exemplo para demonstrar como o sistema funciona quando o backend está indisponível. A resposta inclui código e explicações detalhadas.",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
      is_solution: false
    },
    {
      id: 2,
      question_id: parseInt(questionId),
      author_name: "Maria Santos",
      content: "Outra resposta de demonstração que mostra como diferentes usuários podem contribuir com suas soluções para as questões.",
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
      is_solution: false
    }
  ];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/v1/questions/${params.id}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Se o backend estiver indisponível, simular criação de resposta
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        console.log('Backend indisponível, simulando criação de resposta');
        const mockAnswer = createMockAnswer(body, params.id);
        
        return NextResponse.json({
          success: true,
          data: mockAnswer,
          message: 'Resposta criada com sucesso (modo demonstração)'
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
    console.log('Erro na conexão com backend, simulando criação de resposta');
    
    // Em caso de erro de conexão, simular criação de resposta
    const body = await request.json();
    const mockAnswer = createMockAnswer(body, params.id);
    
    return NextResponse.json({
      success: true,
      data: mockAnswer,
      message: 'Resposta criada com sucesso (modo demonstração)'
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

// Função para criar resposta mockada
function createMockAnswer(body: any, questionId: string) {
  const now = new Date().toISOString();
  
  return {
    id: Math.floor(Math.random() * 1000) + 1,
    question_id: parseInt(questionId),
    author_name: body.author_name || 'Usuário',
    content: body.content || 'Resposta de exemplo',
    created_at: now,
    is_solution: body.is_solution || false
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
