import { NextRequest, NextResponse } from 'next/server';
import { config, resolveJavaApiBaseUrl } from '@/lib/config-simple';
import { noJavaBackendResponse } from '@/lib/proxy-http';

const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

export async function GET(request: NextRequest) {
  try {
    const BACKEND_URL = resolveJavaApiBaseUrl();
    if (!BACKEND_URL) {
      console.error('JAVA backend URL missing (BACKEND_URL / NEXT_PUBLIC_BACKEND_URL / NEXT_PUBLIC_API_URL)');
      return noJavaBackendResponse();
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/v1/questions${queryString ? `?${queryString}` : ''}`;
    
    console.log('🌐 Fetching questions from backend:', url);
    console.log('🔍 Backend URL configurada:', BACKEND_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`⏱️ Timeout atingido após ${config.api.timeout}ms para GET ${url}`);
      controller.abort();
    }, config.api.timeout);
    
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

      if (response.status === 502) {
        console.error('❌ 502 Bad Gateway - Backend não está respondendo corretamente');
        return NextResponse.json(
          { 
            error: 'Bad Gateway',
            message: `O backend em ${BACKEND_URL} não está respondendo corretamente. Verifique se o servidor está rodando e acessível.`,
            details: isDevelopment() ? {
              backendUrl: BACKEND_URL,
              attemptedUrl: url,
              suggestion: 'Verifique se o backend está rodando: go run main.go'
            } : undefined,
          },
          { 
            status: 502,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }

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
      const errorName = fetchError instanceof Error ? fetchError.name : 'Unknown';
      const isTimeout = errorName === 'AbortError' || errorMessage.includes('timeout') || errorMessage.includes('aborted');
      const isConnectionRefused = errorMessage.includes('ERR_CONNECTION_REFUSED') || 
                                  errorMessage.includes('ECONNREFUSED') ||
                                  errorMessage.includes('Connection refused');
      const isNetworkError = errorMessage.includes('Failed to fetch') || 
                            errorMessage.includes('NetworkError') || 
                            errorMessage.includes('ENOTFOUND') ||
                            errorMessage.includes('Network request failed');
      
      console.error(`❌ Erro ao conectar com backend:`, {
        error: errorMessage,
        name: errorName,
        url: url,
        backendUrl: BACKEND_URL,
        isTimeout: isTimeout,
        isConnectionRefused: isConnectionRefused,
        isNetworkError: isNetworkError
      });
      
      let userMessage = 'Backend indisponível. Verifique se o servidor está rodando.';
      let statusCode = 503;
      
      if (isConnectionRefused) {
        userMessage = `Não foi possível conectar ao backend em ${BACKEND_URL}. O servidor pode não estar rodando. Verifique se o backend está iniciado na porta 8080.`;
        statusCode = 503; // Service Unavailable
      } else if (isNetworkError) {
        userMessage = `Não foi possível conectar ao backend em ${BACKEND_URL}. Verifique se o servidor está rodando e acessível.`;
        statusCode = 502; // Bad Gateway
      } else if (isTimeout) {
        userMessage = `A requisição demorou mais de ${config.api.timeout / 1000} segundos. O backend pode estar sobrecarregado ou não está respondendo.`;
      }
      
      return NextResponse.json(
        { 
          error: statusCode === 502 ? 'Bad Gateway' : 'Service Unavailable',
          message: userMessage,
          details: isDevelopment() ? {
            error: errorMessage,
            errorName: errorName,
            backendUrl: BACKEND_URL,
            attemptedUrl: url,
            troubleshooting: [
              'Verifique se o backend está rodando: go run main.go',
              `Verifique se a porta 8080 está acessível: curl http://localhost:8080/health`,
              'Verifique a variável NEXT_PUBLIC_BACKEND_URL no arquivo .env.local',
              'Se estiver usando Docker, verifique se os containers estão rodando: docker-compose ps'
            ]
          } : undefined,
        },
        { 
          status: statusCode,
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
    const BACKEND_URL = resolveJavaApiBaseUrl();
    if (!BACKEND_URL) {
      console.error('JAVA backend URL missing (BACKEND_URL / NEXT_PUBLIC_BACKEND_URL / NEXT_PUBLIC_API_URL)');
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
    const url = `${BACKEND_URL}/api/v1/questions`;
    
    console.log('🌐 Creating question on backend:', url);
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    console.log('⏱️ Timeout configurado:', config.api.timeout, 'ms');

    const timeoutDuration = config.api.timeout * 2;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`⏱️ Timeout atingido após ${timeoutDuration}ms para POST ${url}`);
      controller.abort();
    }, timeoutDuration);
    
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

      const contentType = response.headers.get('content-type') || '';
      const isHTML = contentType.includes('text/html') || contentType.includes('application/xhtml');

      const responseText = await response.text();
      const isHTMLResponse = isHTML || responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html');

      if (response.ok) {
        if (isHTMLResponse) {
          console.error('❌ Backend retornou HTML em vez de JSON. Backend pode estar offline ou com erro.');
          return NextResponse.json(
            { 
              error: 'Bad Gateway',
              message: 'O backend retornou uma resposta HTML em vez de JSON. Isso geralmente indica que o servidor está offline ou com problemas. Se estiver usando Render, verifique os logs do serviço.',
              details: isDevelopment() ? {
                backendUrl: BACKEND_URL,
                attemptedUrl: url,
                contentType: contentType,
                suggestion: 'O backend pode estar hospedado no Render e não está respondendo corretamente. Verifique os logs do Render.'
              } : undefined,
            },
            { 
              status: 502,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            }
          );
        }
        
        const data = JSON.parse(responseText);
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
        let errorData: any = { error: response.statusText };

        if (isHTMLResponse) {
          console.error('❌ Backend retornou página HTML de erro:', response.status);
          errorData = {
            error: 'Bad Gateway',
            message: 'O backend retornou uma página HTML de erro. O servidor pode estar offline ou com problemas. Se estiver usando Render, verifique os logs do serviço.',
            htmlResponse: isDevelopment() ? responseText.substring(0, 500) : undefined
          };
        } else if (responseText) {
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { error: responseText || response.statusText };
          }
        }
        
        console.error(`❌ Backend returned ${response.status}: ${response.statusText}`);
        console.error('📋 Backend error details:', JSON.stringify(errorData, null, 2));

        let errorMessage = 'Erro ao criar questão';

        if (response.status === 400) {
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
      const errorName = fetchError instanceof Error ? fetchError.name : 'Unknown';
      const isTimeout = errorName === 'AbortError' || errorMessage.includes('timeout') || errorMessage.includes('aborted');
      const isNetworkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError');
      
      console.error(`❌ Erro ao conectar com backend:`, {
        error: errorMessage,
        name: errorName,
        url: url,
        isTimeout: isTimeout,
        isNetworkError: isNetworkError,
        backendUrl: BACKEND_URL
      });
      
      let userMessage = 'Backend indisponível. Tente novamente mais tarde.';
      if (isTimeout) {
        userMessage = `A requisição demorou mais de ${timeoutDuration / 1000} segundos. Verifique se o backend está rodando em ${BACKEND_URL}`;
      } else if (isNetworkError) {
        userMessage = `Não foi possível conectar ao backend em ${BACKEND_URL}. Verifique se o servidor está rodando.`;
      }
      
      return NextResponse.json(
        { 
          error: 'Service Unavailable',
          message: userMessage,
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
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
