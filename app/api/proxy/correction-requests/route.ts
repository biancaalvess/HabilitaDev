import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config-simple';

const JAVA_BASE = config.api.backendUrl;

export async function POST(request: NextRequest) {
  try {
    if (!JAVA_BASE) {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          message:
            'Backend não está configurado. Defina BACKEND_URL ou NEXT_PUBLIC_API_URL (URL do Java) no ambiente.',
        },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'JSON inválido no corpo da requisição.',
        },
        { status: 400 }
      );
    }

    const url = `${JAVA_BASE}/api/v1/correction-requests`;
    const timeoutDuration = config.api.timeout * 2;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

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

      const text = await response.text();
      const contentType = response.headers.get('content-type') || '';
      const looksHtml =
        contentType.includes('text/html') ||
        text.trimStart().startsWith('<!DOCTYPE') ||
        text.trimStart().startsWith('<html');

      if (!response.ok) {
        if (looksHtml || response.status === 502) {
          return NextResponse.json(
            {
              error: 'Bad Gateway',
              message:
                'O servidor Java não devolveu JSON (502 ou página HTML). Verifique se o Spring está a correr e se o endpoint POST /api/v1/correction-requests existe.',
            },
            { status: 502 }
          );
        }
        let payload: Record<string, unknown> = { message: response.statusText };
        try {
          payload = text ? (JSON.parse(text) as Record<string, unknown>) : payload;
        } catch {
          payload = { message: text || response.statusText };
        }
        return NextResponse.json(
          {
            error: payload.error || 'Backend Error',
            message:
              (typeof payload.message === 'string' && payload.message) ||
              `Erro ao enviar solicitação (${response.status})`,
            details: payload.details ?? payload.errors,
          },
          { status: response.status }
        );
      }

      if (looksHtml) {
        return NextResponse.json(
          {
            error: 'Bad Gateway',
            message: 'Resposta inesperada (HTML) do backend.',
          },
          { status: 502 }
        );
      }

      const data = text ? JSON.parse(text) : {};
      return NextResponse.json(data, {
        status: response.status,
        headers: { 'X-Data-Source': 'backend' },
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const msg = fetchErr instanceof Error ? fetchErr.message : 'Erro de rede';
      const isAbort = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      return NextResponse.json(
        {
          error: isAbort ? 'Gateway Timeout' : 'Bad Gateway',
          message: isAbort
            ? `O backend demorou mais de ${timeoutDuration / 1000}s a responder.`
            : `Não foi possível contactar o Java em ${JAVA_BASE}. ${msg}`,
        },
        { status: isAbort ? 504 : 502 }
      );
    }
  } catch (e) {
    console.error('correction-requests proxy:', e);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Erro interno no proxy.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
