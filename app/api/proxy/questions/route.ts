import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config-simple';

const BACKEND_URL = config.api.backendUrl;

export async function GET(request: NextRequest) {
  try {
    // Verificar se BACKEND_URL está configurado
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

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/v1/questions${queryString ? `?${queryString}` : ''}`;
    
    console.log('🌐 Fetching questions from backend:', url);
    
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
        console.log('✅ Successfully fetched questions from backend');
        
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
        // Repassar status e mensagem do backend
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error(`❌ Backend returned ${response.status}: ${response.statusText}`);
        
        return NextResponse.json(
          { 
            error: 'Backend Error',
            message: errorData.message || errorData.error || 'Erro ao buscar questões',
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
    console.error('❌ Error in questions route:', error);
    
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

export async function POST(request: NextRequest) {
  try {
    // Verificar se BACKEND_URL está configurado
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

    // Tentar fazer parse do body com tratamento de erro
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('❌ Error parsing request body:', jsonError);
      return NextResponse.json(
        { 
          error: 'Bad Request',
          message: 'Erro ao processar o corpo da requisição. Verifique se o JSON está válido.',
          details: jsonError instanceof Error ? jsonError.message : 'Unknown error',
        },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
    const url = `${BACKEND_URL}/api/v1/questions`;
    
    console.log('🌐 Creating question on backend:', url);
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
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
      
      console.log(`📡 Backend response status: ${response.status} ${response.statusText}`);

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully created question on backend');
        
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
        // Repassar status e mensagem do backend
        let errorData: any = { error: response.statusText };
        try {
          const responseText = await response.text();
          if (responseText) {
            try {
              errorData = JSON.parse(responseText);
            } catch {
              errorData = { error: responseText || response.statusText };
            }
          }
        } catch (readError) {
          console.error('❌ Error reading backend error response:', readError);
        }
        
        console.error(`❌ Backend returned ${response.status}: ${response.statusText}`);
        console.error('📋 Backend error details:', JSON.stringify(errorData, null, 2));
        
        // Mensagem mais específica para diferentes status codes
        let errorMessage = 'Erro ao criar questão';
        
        if (response.status === 400) {
          // 400: Bad Request - geralmente erro de validação
          errorMessage = errorData.message || errorData.error || 'Dados inválidos. Verifique os campos preenchidos.';
          if (errorData.details) {
            errorMessage += ` Detalhes: ${JSON.stringify(errorData.details)}`;
          }
          console.error('❌ 400 - Bad Request. Verifique os dados enviados:', JSON.stringify(body, null, 2));
        } else if (response.status === 404) {
          errorMessage = `Endpoint não encontrado no backend (${url}). Verifique se:
1. O backend está rodando em ${BACKEND_URL}
2. O endpoint POST /api/v1/questions existe no backend
3. A variável NEXT_PUBLIC_BACKEND_URL está configurada corretamente`;
          console.error('❌ 404 - Endpoint não encontrado:', url);
          console.error('📋 Verifique se o backend Go tem a rota POST /api/v1/questions implementada');
        } else {
          errorMessage = errorData.message || errorData.error || `Erro do backend (${response.status})`;
        }
        
        return NextResponse.json(
          { 
            error: response.status === 400 ? 'Bad Request' : 'Backend Error',
            message: errorMessage,
            details: errorData.details || errorData.errors || undefined,
            status: response.status,
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
    console.error('❌ Error creating question:', error);
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
