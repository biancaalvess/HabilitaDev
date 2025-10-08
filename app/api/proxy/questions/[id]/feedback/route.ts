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
      signal: AbortSignal.timeout(30000), // Timeout de 30 segundos
    });

    console.log(`[FEEDBACK POST] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FEEDBACK POST] Backend error: ${errorText}`);
      
      return NextResponse.json({
        success: false,
        error: 'Falha ao criar feedback',
        message: `Backend respondeu com status: ${response.status}`,
        details: errorText
      }, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
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
    
    return NextResponse.json({
      success: false,
      error: 'Falha na conexão com o backend',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      details: 'Verifique se o backend está online e acessível'
    }, {
      status: 503,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
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
      signal: AbortSignal.timeout(30000), // Timeout de 30 segundos
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FEEDBACK GET] Backend error: ${errorText}`);
      
      return NextResponse.json({
        success: false,
        error: 'Falha ao buscar feedbacks',
        message: `Backend respondeu com status: ${response.status}`,
        details: errorText
      }, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
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
    console.error('[FEEDBACK GET] Proxy error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Falha na conexão com o backend',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      details: 'Verifique se o backend está online e acessível'
    }, {
      status: 503,
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

// Removido: Funções createMockFeedback() e getMockFeedback() - 100% dados reais do backend