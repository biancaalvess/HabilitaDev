import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config-simple';
import { mockAnswers } from '@/lib/mock-data';

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

    // 2. Usar dados mock como fallback
    console.log('📦 Using mock answers data');
    const filteredAnswers = mockAnswers.filter(answer => answer.question_id === parseInt(questionId));
    
    return NextResponse.json(filteredAnswers, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Data-Source': 'mock-data',
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

    // 2. Simular resposta de sucesso
    console.log('📦 Simulating successful answer post');
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Answer posted successfully (offline mode)',
        data: {
          id: Date.now(),
          question_id: parseInt(questionId),
          ...body,
          created_at: new Date().toISOString(),
        }
      },
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'X-Data-Source': 'mock-simulation',
        },
      }
    );

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