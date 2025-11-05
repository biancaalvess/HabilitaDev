import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database-simple';
import { config } from '@/lib/config-simple';

const BACKEND_URL = config.api.backendUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;
    
    // 1. Tentar buscar do backend externo
    if (BACKEND_URL) {
      try {
        const url = `${BACKEND_URL}/api/v1/questions/${questionId}`;
      console.log('🌐 Fetching question from backend:', url);
      
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
        console.log('✅ Successfully fetched question from backend');
        
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
        console.warn(`⚠️ Backend returned ${response.status} for question ${questionId}`);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable for question:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }
    } else {
      console.log('ℹ️ BACKEND_URL não configurado, usando apenas banco local');
    }

    // 2. Tentar buscar do banco local
    try {
      console.log('💾 Attempting to fetch question from local database');
      await databaseService.connect();
      const localQuestion = await databaseService.getQuestionById(parseInt(questionId));
      
      if (localQuestion) {
        console.log('✅ Successfully fetched question from local database');
        
        return NextResponse.json(localQuestion, {
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
      console.warn('⚠️ Local database unavailable for question:', dbError instanceof Error ? dbError.message : 'Unknown error');
    }

    // 3. Retornar erro 404 se questão não encontrada
    console.log('📦 Question not found in backend or local database');
    
    return NextResponse.json(
      { 
        error: 'Question not found',
        message: `Question with ID ${questionId} not found in any available source`,
      },
      { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );

  } catch (error) {
    console.error('❌ Error in question route:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to fetch question',
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await databaseService.connect();
    const questionId = parseInt(params.id);
    const body = await request.json();

    // Atualizar questão no banco local
    const updatedQuestion = await databaseService.updateQuestion(questionId, body);

    return NextResponse.json(updatedQuestion, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to update question',
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await databaseService.connect();
    const questionId = parseInt(params.id);

    await databaseService.deleteQuestion(questionId);

    return NextResponse.json(
      { success: true, message: 'Question deleted successfully' },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to delete question',
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