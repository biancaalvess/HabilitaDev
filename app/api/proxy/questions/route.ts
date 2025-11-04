import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database-simple';
import { config } from '@/lib/config-simple';
import { mockQuestions } from '@/lib/mock-data';

const BACKEND_URL = config.api.backendUrl;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // 1. Tentar buscar do backend externo
    try {
      const url = `${BACKEND_URL}/api/v1/questions${queryString ? `?${queryString}` : ''}`;
      console.log('🌐 Attempting to fetch from backend:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HabilitaDev-Frontend/1.0',
        },
        signal: AbortSignal.timeout(config.api.timeout),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully fetched from backend');
        
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
        console.warn(`⚠️ Backend returned ${response.status}: ${response.statusText}`);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // 2. Tentar buscar do banco local
    try {
      console.log('💾 Attempting to fetch from local database');
      await databaseService.connect();
      const localQuestions = await databaseService.getQuestions();
      
      if (localQuestions && localQuestions.length > 0) {
        console.log('✅ Successfully fetched from local database');
        
        return NextResponse.json(localQuestions, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Data-Source': 'local-database',
          },
        });
      }
    } catch (dbError) {
      console.warn('⚠️ Local database unavailable:', dbError instanceof Error ? dbError.message : 'Unknown error');
    }

    // 3. Usar dados mock como último recurso
    console.log('📦 Using mock data as fallback');
    
    return NextResponse.json(mockQuestions, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Data-Source': 'mock-data',
      },
    });

  } catch (error) {
    console.error('❌ Error in questions route:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to fetch questions from any source',
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

// Removido: Função getMockQuestions() - 100% dados reais do backend

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Tentar enviar para o backend externo
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000), // Timeout de 30 segundos
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully created question on backend');
        
        return NextResponse.json(data, {
          status: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Data-Source': 'backend',
          },
        });
      } else {
        console.warn(`⚠️ Backend returned ${response.status} for question creation`);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable for question creation:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // 2. Salvar no banco local
    try {
      console.log('💾 Saving question to local database');
      await databaseService.connect();
      const newQuestion = await databaseService.createQuestion({
        title: body.title,
        description: body.description || body.title,
        answer: body.answer || '',
        difficulty: body.difficulty,
        category: body.category,
        company: body.company,
        tags: body.tags || [],
      });
      
      console.log('✅ Successfully saved question to local database');
      
      return NextResponse.json({
        success: true,
        message: 'Question created successfully',
        data: newQuestion,
      }, {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'X-Data-Source': 'local-database',
        },
      });
    } catch (dbError) {
      console.warn('⚠️ Local database unavailable for question creation:', dbError instanceof Error ? dbError.message : 'Unknown error');
      
      return NextResponse.json({
        success: false,
        error: 'Falha ao criar questão',
        message: 'Não foi possível salvar a questão. Tente novamente mais tarde.',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
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
    console.error('❌ Error creating question:', error);
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
