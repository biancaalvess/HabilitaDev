import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config-simple';

const BACKEND_URL = config.api.backendUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!BACKEND_URL) {
      console.error('❌ BACKEND_URL não configurado');
      return NextResponse.json(
        { 
          error: 'Service Unavailable',
          message: 'Backend não está configurado. Configure BACKEND_URL no ambiente.',
        },
        { 
          status: 503,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const questionId = params.id;
    const url = `${BACKEND_URL}/api/v1/questions/${questionId}/feedback`;
    
    console.log('🌐 Fetching feedback from backend:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HabilitaDev-Frontend/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully fetched feedback from backend');
        
        return NextResponse.json(data, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Data-Source': 'backend',
          },
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error(`❌ Backend returned ${response.status}: ${response.statusText}`);
        
        return NextResponse.json(
          { 
            error: 'Backend Error',
            message: errorData.message || errorData.error || 'Erro ao buscar feedback',
            details: errorData.details || undefined,
          },
          { 
            status: response.status,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('aborted');
      
      console.error(`❌ Backend unavailable: ${errorMessage}`);
      
      return NextResponse.json(
        { 
          error: 'Service Unavailable',
          message: isTimeout 
            ? 'Backend timeout. Tente novamente mais tarde.' 
            : 'Backend indisponível. Tente novamente mais tarde.',
          details: errorMessage,
        },
        { 
          status: 503,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
  } catch (error) {
    console.error('❌ Error in feedback route:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Erro interno ao processar requisição',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!BACKEND_URL) {
      console.error('❌ BACKEND_URL não configurado');
      return NextResponse.json(
        { 
          error: 'Service Unavailable',
          message: 'Backend não está configurado. Configure BACKEND_URL no ambiente.',
        },
        { 
          status: 503,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const questionId = params.id;
    const body = await request.json();
    const url = `${BACKEND_URL}/api/v1/questions/${questionId}/feedback`;
    
    console.log('🌐 Posting feedback to backend:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HabilitaDev-Frontend/1.0',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully posted feedback to backend');
        
        return NextResponse.json(data, {
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Data-Source': 'backend',
          },
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error(`❌ Backend returned ${response.status}: ${response.statusText}`);
        
        return NextResponse.json(
          { 
            error: 'Backend Error',
            message: errorData.message || errorData.error || 'Erro ao criar feedback',
            details: errorData.details || undefined,
          },
          { 
            status: response.status,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('aborted');
      
      console.error(`❌ Backend unavailable: ${errorMessage}`);
      
      return NextResponse.json(
        { 
          error: 'Service Unavailable',
          message: isTimeout 
            ? 'Backend timeout. Tente novamente mais tarde.' 
            : 'Backend indisponível. Tente novamente mais tarde.',
          details: errorMessage,
        },
        { 
          status: 503,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
  } catch (error) {
    console.error('❌ Error posting feedback:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Erro interno ao processar requisição',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
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
