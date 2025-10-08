import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const AI_VALIDATION_URL = process.env.AI_VALIDATION_URL || 'http://localhost:5000'; // URL da sua IA

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
    console.log(`[AI VALIDATION] Tentando backend tradicional: ${BACKEND_URL}/api/v1/questions/${params.id}/validate-answer`);
    
    const response = await fetch(`${BACKEND_URL}/api/v1/questions/${params.id}/validate-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

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
        },
      });
    }

    // Fallback final: validação local
    console.log('[AI VALIDATION] Usando validação local como fallback');
    const localValidation = validateAnswerLocally(body.user_answer, body.correct_answer);

    return NextResponse.json({
      success: true,
      data: {
        ...localValidation,
        validation_method: 'local_fallback'
      },
      message: 'Validação realizada localmente (modo demonstração)'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('[AI VALIDATION] Erro geral:', error);
    
    // Fallback de emergência
    const localValidation = validateAnswerLocally('', '');
    
    return NextResponse.json({
      success: true,
      data: {
        ...localValidation,
        validation_method: 'emergency_fallback'
      },
      message: 'Validação realizada localmente (modo emergência)'
    }, {
      status: 200,
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

// Validação local como fallback
function validateAnswerLocally(userAnswer: string, correctAnswer: string) {
  const userLower = userAnswer.toLowerCase();

  // Critérios obrigatórios para uma resposta correta
  const requiredElements = {
    algorithm: false,
    complexity: false,
    concept: false,
    explanation: false,
  };

  let score = 0;
  let details: string[] = [];
  let feedback = '';

  // 1. VERIFICAR ALGORITMO ESPECÍFICO (Critério principal - 40 pontos)
  if (userLower.includes('quicksort')) {
    requiredElements.algorithm = true;
    score += 40;
    details.push('✅ Algoritmo correto: Quicksort identificado');
  } else if (userLower.includes('mergesort')) {
    requiredElements.algorithm = true;
    score += 35;
    details.push('✅ Algoritmo eficiente: Mergesort identificado');
  } else if (userLower.includes('heapsort')) {
    requiredElements.algorithm = true;
    score += 35;
    details.push('✅ Algoritmo eficiente: Heapsort identificado');
  } else {
    details.push('❌ Algoritmo: Não especificou um algoritmo de ordenação eficiente');
  }

  // 2. VERIFICAR COMPLEXIDADE TEMPORAL (Critério obrigatório - 30 pontos)
  if (userLower.includes('o(n log n)') || userLower.includes('o(n²)')) {
    requiredElements.complexity = true;
    score += 30;
    if (userLower.includes('o(n log n)')) {
      details.push('✅ Complexidade: O(n log n) mencionada corretamente');
    }
    if (userLower.includes('o(n²)')) {
      details.push('✅ Complexidade: O(n²) no pior caso mencionada');
    }
  } else {
    details.push('❌ Complexidade: Não mencionou a complexidade temporal');
  }

  // 3. VERIFICAR CONCEITO DE DIVISÃO E CONQUISTA (Critério importante - 20 pontos)
  if (userLower.includes('pivô') || userLower.includes('particiona')) {
    requiredElements.concept = true;
    score += 20;
    details.push('✅ Conceito: Explicou o funcionamento com pivô/particionamento');
  } else if (userLower.includes('divisão') && userLower.includes('conquista')) {
    requiredElements.concept = true;
    score += 15;
    details.push('✅ Conceito: Mencionou divisão e conquista');
  } else {
    details.push('❌ Conceito: Não explicou como o algoritmo funciona');
  }

  // 4. VERIFICAR QUALIDADE DA EXPLICAÇÃO (Critério complementar - 10 pontos)
  if (userAnswer.length > 100) {
    requiredElements.explanation = true;
    score += 10;
    details.push('✅ Explicação: Resposta detalhada e bem estruturada');
  } else if (userAnswer.length > 50) {
    score += 5;
    details.push('⚠️ Explicação: Resposta adequada, mas pode ser mais detalhada');
  } else {
    details.push('❌ Explicação: Resposta muito breve, precisa de mais detalhes');
  }

  // DETERMINAR SE ESTÁ CORRETO
  const isCorrect = requiredElements.algorithm && requiredElements.complexity && requiredElements.concept;

  // FEEDBACK ESPECÍFICO BASEADO NA CORREÇÃO
  if (isCorrect) {
    feedback = '🎉 RESPOSTA CORRETA! Você demonstrou compreensão completa do algoritmo de ordenação, incluindo sua complexidade e funcionamento.';
  } else {
    const missingElements = [];
    if (!requiredElements.algorithm) missingElements.push('especificar o algoritmo');
    if (!requiredElements.complexity) missingElements.push('mencionar a complexidade');
    if (!requiredElements.concept) missingElements.push('explicar como funciona');

    feedback = `❌ RESPOSTA INCORRETA. Sua resposta está incompleta. Faltou: ${missingElements.join(', ')}.`;
  }

  return {
    is_correct: isCorrect,
    score: Math.min(score, 100),
    feedback: feedback,
    details: details,
  };
}
