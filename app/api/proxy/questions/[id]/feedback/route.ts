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
      const url = `${BACKEND_URL}/api/v1/questions/${questionId}/feedback`;
      console.log('🌐 Fetching feedback from backend:', url);
      
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
        console.warn(`⚠️ Backend returned ${response.status} for feedback`);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable for feedback:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // 2. Tentar buscar do banco local
    try {
      console.log('💾 Attempting to fetch feedback from local database');
      await databaseService.connect();
      const localFeedback = await databaseService.getFeedback(parseInt(questionId));
      
      if (localFeedback && localFeedback.length > 0) {
        console.log('✅ Successfully fetched feedback from local database');
        
        return NextResponse.json(localFeedback, {
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
      console.warn('⚠️ Local database unavailable for feedback:', dbError instanceof Error ? dbError.message : 'Unknown error');
    }

    // 3. Retornar array vazio se nenhuma fonte estiver disponível
    console.log('📦 No feedback available from backend or local database');
    
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
    console.error('❌ Error in feedback route:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to fetch feedback',
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
      const url = `${BACKEND_URL}/api/v1/questions/${questionId}/feedback`;
      console.log('🌐 Posting feedback to backend:', url);
      
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
        console.log('✅ Successfully posted feedback to backend');
        
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
        console.warn(`⚠️ Backend returned ${response.status} for feedback post`);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable for feedback post:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // 2. Salvar no banco local
    try {
      console.log('💾 Saving feedback to local database');
      await databaseService.connect();
      const newFeedback = await databaseService.createFeedback({
        question_id: parseInt(questionId),
        feedback_type: body.feedback_type,
        content: body.content,
        status: body.status || 'pending',
        user_id: body.user_id || undefined,
      });
      
      console.log('✅ Successfully saved feedback to local database');
      
      return NextResponse.json({
        success: true,
        message: 'Feedback posted successfully',
        data: newFeedback,
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
      console.warn('⚠️ Local database unavailable for feedback post:', dbError instanceof Error ? dbError.message : 'Unknown error');
      
      // 3. Retornar erro se não conseguir salvar
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to save feedback',
          message: 'Unable to save feedback. Please try again later.',
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
    console.error('❌ Error posting feedback:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to post feedback',
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