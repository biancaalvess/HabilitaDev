import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://habilitadev-backend.onrender.com';

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
      signal: AbortSignal.timeout(30000), // Timeout de 30 segundos
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[COMMENTS GET] Backend error: ${errorText}`);
      
      return NextResponse.json({
        success: false,
        error: 'Falha ao buscar comentários',
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
    console.error('[COMMENTS GET] Proxy error:', error);
    
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

// Removido: Função getMockComments() - 100% dados reais do backend

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
      signal: AbortSignal.timeout(30000), // Timeout de 30 segundos
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[COMMENTS POST] Backend error: ${errorText}`);
      
      return NextResponse.json({
        success: false,
        error: 'Falha ao criar comentário',
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
    console.error('[COMMENTS POST] Proxy error:', error);
    
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

// Removido: Função createMockComment() - 100% dados reais do backend

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
