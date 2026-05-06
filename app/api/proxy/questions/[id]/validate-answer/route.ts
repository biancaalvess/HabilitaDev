import { NextRequest, NextResponse } from 'next/server';
import { config, resolveJavaApiBaseUrl } from '@/lib/config-simple';
import { noJavaBackendResponse } from '@/lib/proxy-http';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const BACKEND_URL = resolveJavaApiBaseUrl();
    if (!BACKEND_URL) {
      console.error('JAVA backend URL missing');
      return noJavaBackendResponse();
    }

    console.log(`[VALIDAÇÃO] Iniciando validação para questão ${params.id}`);

    const body = await request.json();
    console.log('[VALIDAÇÃO] Dados recebidos:', body);

    const url = `${BACKEND_URL}/api/v1/validation/${params.id}/validate-answer`;
    console.log(`[VALIDAÇÃO] Enviando para backend: ${url}`);
    
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
        console.log('[VALIDAÇÃO] Resultado recebido do backend:', data);

        return NextResponse.json({
          success: true,
          data: data,
          message: 'Validação realizada com sucesso'
        }, {
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
            success: false,
            error: 'Backend Error',
            message: errorData.message || errorData.error || 'Erro ao validar resposta',
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

      return NextResponse.json({
        success: false,
        error: 'Service Unavailable',
        message: isTimeout 
          ? 'Timeout ao validar resposta. Tente novamente mais tarde.' 
          : 'Serviço de validação indisponível. Tente novamente mais tarde.',
        details: errorMessage,
      }, {
        status: 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

  } catch (error) {
    console.error('[VALIDAÇÃO] Erro ao processar requisição:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar validação',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      details: 'Não foi possível processar a validação. Tente novamente mais tarde.'
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

