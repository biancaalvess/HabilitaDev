import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config-simple';

const BACKEND_URL = config.api.backendUrl;
const AI_VALIDATION_URL = process.env.AI_VALIDATION_URL || 'http://localhost:5000';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[AI VALIDATION] Iniciando validação por IA para question ${params.id}`);
    
    const body = await request.json();
    console.log('[AI VALIDATION] Dados recebidos:', body);

    // Tentar usar a IA primeiro
    try {
      console.log(`[AI VALIDATION] Enviando para IA: ${AI_VALIDATION_URL}/validate`);
      
      const aiResponse = await fetch(`${AI_VALIDATION_URL}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_answer: body.user_answer,
          question_id: params.id,
          correct_answer: body.correct_answer || '',
          question_context: body.question_context || ''
        }),
        signal: AbortSignal.timeout(30000), // Timeout de 30 segundos para IA
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        console.log('[AI VALIDATION] Resultado da IA:', aiResult);

        return NextResponse.json({
          success: true,
          data: {
            is_correct: aiResult.is_correct || false,
            score: aiResult.score || 0,
            feedback: aiResult.feedback || 'Feedback da IA',
            details: aiResult.details || [],
            validation_method: 'ai',
            ai_confidence: aiResult.confidence || 0.8
          },
          message: 'Validação realizada por IA'
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }
    } catch (aiError) {
      console.log('[AI VALIDATION] IA indisponível, usando validação local:', aiError);
    }

    // Fallback: usar backend tradicional
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

    console.log(`[AI VALIDATION] Tentando backend tradicional: ${BACKEND_URL}/api/v1/questions/${params.id}/verify-answer`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/questions/${params.id}/verify-answer`, {
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
        console.log('[AI VALIDATION] Resultado do backend:', data);

        return NextResponse.json({
          success: true,
          data: {
            ...data,
            validation_method: 'backend'
          },
          message: 'Validação realizada pelo backend'
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
        // Repassar status e mensagem do backend
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
      
      // Fallback final: Erro - IA e Backend indisponíveis
      return NextResponse.json({
        success: false,
        error: 'Service Unavailable',
        message: isTimeout 
          ? 'Backend timeout. Tente novamente mais tarde.' 
          : 'Não foi possível validar a resposta. IA e Backend estão indisponíveis.',
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
    console.error('[AI VALIDATION] Erro geral:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar validação',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      details: 'Todos os serviços de validação estão indisponíveis. Tente novamente mais tarde.'
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

