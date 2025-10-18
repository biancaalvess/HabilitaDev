import { NextResponse } from 'next/server';
import { AppError, formatErrorResponse, logError } from './error-handler';

// Interface para resposta de sucesso
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    version?: string;
    requestId?: string;
  };
}

// Interface para resposta de erro
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    statusCode: number;
    timestamp: string;
  };
  message: string;
}

// Tipo união para todas as respostas
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Função para criar resposta de sucesso
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: SuccessResponse<T>['meta']
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message: message || 'Success',
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Função para criar resposta de erro
export function createErrorResponse(
  error: AppError,
  context?: string
): NextResponse<ErrorResponse> {
  // Log do erro
  logError(error, context);
  
  // Formatar resposta
  const errorResponse = formatErrorResponse(error);
  
  return NextResponse.json(errorResponse, {
    status: error.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Função para tratar erros em rotas da API
export function handleApiError(error: unknown, context?: string): NextResponse<ErrorResponse> {
  if (error instanceof AppError) {
    return createErrorResponse(error, context);
  }
  
  // Converter erro desconhecido em AppError
  const appError = new AppError(
    error instanceof Error ? error.message : 'Erro desconhecido',
    'UNKNOWN_ERROR',
    500,
    error
  );
  
  return createErrorResponse(appError, context);
}

// Função para wrapper de rotas da API
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, handler.name);
    }
  };
}

// Função para validação de dados
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    throw new AppError(
      `Campos obrigatórios: ${missingFields.join(', ')}`,
      'VALIDATION_ERROR',
      400,
      { missingFields }
    );
  }
}

// Função para validação de email
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Email inválido', 'VALIDATION_INVALID_EMAIL', 400);
  }
}

// Função para validação de senha
export function validatePassword(password: string, minLength: number = 6): void {
  if (password.length < minLength) {
    throw new AppError(
      `Senha deve ter pelo menos ${minLength} caracteres`,
      'VALIDATION_PASSWORD_TOO_SHORT',
      400
    );
  }
}

// Função para sanitizar dados
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}
