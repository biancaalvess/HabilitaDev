import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config-simple';
import { databaseService } from '@/lib/database-simple';

const BACKEND_URL = config.api.backendUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;
    
    // 1. Tentar buscar do backend externo
    try {
      const url = `${BACKEND_URL}/api/v1/questions/${questionId}/answers`;
      console.log('🌐 Fetching answers from backend:', url);
      
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
        console.log('✅ Successfully fetched answers from backend');
        
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
        console.warn(`⚠️ Backend returned ${response.status} for answers`);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable for answers:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // 2. Tentar buscar do banco local
    try {
      console.log('💾 Attempting to fetch answers from local database');
      await databaseService.connect();
      const localAnswers = await databaseService.getAnswers(parseInt(questionId));
      
      if (localAnswers && localAnswers.length > 0) {
        console.log('✅ Successfully fetched answers from local database');
        
        return NextResponse.json(localAnswers, {
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
      console.warn('⚠️ Local database unavailable for answers:', dbError instanceof Error ? dbError.message : 'Unknown error');
    }

    // 3. Retornar array vazio se nenhuma fonte estiver disponível
    console.log('📦 No answers available from backend or local database');
    
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Data-Source': 'none',
      },
    });

  } catch (error) {
    console.error('❌ Error in answers route:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to fetch answers',
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
    const questionId = params.id;
    const body = await request.json();
    
    // 1. Tentar enviar para o backend externo
    try {
      const url = `${BACKEND_URL}/api/v1/questions/${questionId}/answers`;
      console.log('🌐 Posting answer to backend:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HabilitaDev-Frontend/1.0',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(config.api.timeout),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully posted answer to backend');
        
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
        console.warn(`⚠️ Backend returned ${response.status} for answer post`);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable for answer post:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // 2. Salvar no banco local
    try {
      console.log('💾 Saving answer to local database');
      await databaseService.connect();
      const newAnswer = await databaseService.createAnswer({
        question_id: parseInt(questionId),
        author_name: body.author_name || 'Anônimo',
        content: body.content,
        is_solution: body.is_solution || false,
      });
      
      console.log('✅ Successfully saved answer to local database');
      
      return NextResponse.json({
        success: true,
        message: 'Answer posted successfully',
        data: newAnswer,
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
      console.warn('⚠️ Local database unavailable for answer post:', dbError instanceof Error ? dbError.message : 'Unknown error');
      
      // 3. Retornar erro se não conseguir salvar
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to save answer',
          message: 'Unable to save answer. Please try again later.',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
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
    console.error('❌ Error posting answer:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to post answer',
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