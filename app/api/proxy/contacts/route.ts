import { NextRequest, NextResponse } from 'next/server';
import { config, resolveJavaApiBaseUrl } from '@/lib/config-simple';
import { noJavaBackendResponse } from '@/lib/proxy-http';

export async function POST(request: NextRequest) {
  try {
    const BACKEND_URL = resolveJavaApiBaseUrl();
    if (!BACKEND_URL) {
      console.error('JAVA backend URL missing');
      return noJavaBackendResponse();
    }

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

    const url = `${BACKEND_URL}/api/v1/contacts`;
    
    console.log('🌐 Criando contato no backend:', url);
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
        console.log('✅ Contato criado com sucesso no backend');
        
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
        
        let errorMessage = 'Erro ao criar contato';
        
        if (response.status === 400) {
          errorMessage = errorData.message || errorData.error || 'Dados inválidos. Verifique os campos preenchidos.';
          if (errorData.details) {
            errorMessage += ` Detalhes: ${JSON.stringify(errorData.details)}`;
          }
          console.error('❌ 400 - Bad Request. Verifique os dados enviados:', JSON.stringify(body, null, 2));
        } else if (response.status === 404) {
          errorMessage = `Endpoint não encontrado no backend (${url}). Verifique se:
1. O backend está rodando em ${BACKEND_URL}
2. O endpoint POST /api/v1/contacts existe no backend
3. A variável NEXT_PUBLIC_BACKEND_URL está configurada corretamente`;
          console.error('❌ 404 - Endpoint não encontrado:', url);
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
    console.error('❌ Error creating contact:', error);
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

