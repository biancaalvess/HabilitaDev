import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createError, ERROR_CODES } from '@/lib/error-handler';

// Função para capturar erros em middleware
export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error('Erro no middleware', 'MIDDLEWARE', { 
        url: req.url,
        method: req.method,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      // Retornar resposta de erro padronizada
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Erro interno do servidor',
            statusCode: 500,
            timestamp: new Date().toISOString(),
          },
          message: 'Erro interno do servidor',
        },
        { status: 500 }
      );
    }
  };
}

// Função para capturar erros em rotas da API
export function withApiErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      const appError = error instanceof Error 
        ? createError('INTERNAL_SERVER_ERROR', error.message)
        : createError('INTERNAL_SERVER_ERROR', 'Erro interno do servidor');

      logger.error('Erro na API', 'API', {
        url: req.url,
        method: req.method,
        error: appError.message,
        stack: appError.stack,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: appError.code,
            message: appError.message,
            statusCode: appError.statusCode,
            timestamp: new Date().toISOString(),
          },
          message: appError.message,
        },
        { status: appError.statusCode }
      );
    }
  };
}

// Função para capturar erros de validação
export function handleValidationError(errors: any[]) {
  logger.warn('Erro de validação', 'VALIDATION', { errors });
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Erro de validação',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        details: errors,
      },
      message: 'Dados inválidos fornecidos',
    },
    { status: 400 }
  );
}

// Função para capturar erros de autenticação
export function handleAuthError(message: string = 'Não autorizado') {
  logger.warn('Erro de autenticação', 'AUTH', { message });
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
        message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      },
      message,
    },
    { status: 401 }
  );
}

// Função para capturar erros de permissão
export function handlePermissionError(message: string = 'Acesso negado') {
  logger.warn('Erro de permissão', 'AUTH', { message });
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.AUTH_FORBIDDEN,
        message,
        statusCode: 403,
        timestamp: new Date().toISOString(),
      },
      message,
    },
    { status: 403 }
  );
}

// Função para capturar erros de recurso não encontrado
export function handleNotFoundError(message: string = 'Recurso não encontrado') {
  logger.warn('Recurso não encontrado', 'API', { message });
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message,
        statusCode: 404,
        timestamp: new Date().toISOString(),
      },
      message,
    },
    { status: 404 }
  );
}

// Função para capturar erros de rate limiting
export function handleRateLimitError(message: string = 'Muitas requisições') {
  logger.warn('Rate limit excedido', 'RATE_LIMIT', { message });
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.API_RATE_LIMITED,
        message,
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
      message,
    },
    { status: 429 }
  );
}
