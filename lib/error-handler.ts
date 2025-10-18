// Sistema centralizado de tratamento de erros
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
  message: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Códigos de erro padronizados
export const ERROR_CODES = {
  // Erros de autenticação
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  
  // Erros de validação
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  VALIDATION_PASSWORD_TOO_SHORT: 'VALIDATION_PASSWORD_TOO_SHORT',
  
  // Erros de API
  API_BACKEND_UNAVAILABLE: 'API_BACKEND_UNAVAILABLE',
  API_TIMEOUT: 'API_TIMEOUT',
  API_NETWORK_ERROR: 'API_NETWORK_ERROR',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  
  // Erros de banco de dados
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',
  DATABASE_CONSTRAINT_ERROR: 'DATABASE_CONSTRAINT_ERROR',
  
  // Erros de negócio
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  QUESTION_NOT_FOUND: 'QUESTION_NOT_FOUND',
  QUESTION_ALREADY_EXISTS: 'QUESTION_ALREADY_EXISTS',
  
  // Erros gerais
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Credenciais inválidas',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Token expirado',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Token inválido',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'Não autorizado',
  [ERROR_CODES.AUTH_FORBIDDEN]: 'Acesso negado',
  
  [ERROR_CODES.VALIDATION_ERROR]: 'Erro de validação',
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'Campo obrigatório',
  [ERROR_CODES.VALIDATION_INVALID_EMAIL]: 'Email inválido',
  [ERROR_CODES.VALIDATION_PASSWORD_TOO_SHORT]: 'Senha muito curta',
  
  [ERROR_CODES.API_BACKEND_UNAVAILABLE]: 'Backend indisponível',
  [ERROR_CODES.API_TIMEOUT]: 'Timeout da requisição',
  [ERROR_CODES.API_NETWORK_ERROR]: 'Erro de rede',
  [ERROR_CODES.API_RATE_LIMITED]: 'Muitas requisições',
  
  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: 'Erro de conexão com banco',
  [ERROR_CODES.DATABASE_QUERY_ERROR]: 'Erro na consulta',
  [ERROR_CODES.DATABASE_CONSTRAINT_ERROR]: 'Violação de restrição',
  
  [ERROR_CODES.USER_NOT_FOUND]: 'Usuário não encontrado',
  [ERROR_CODES.USER_ALREADY_EXISTS]: 'Usuário já existe',
  [ERROR_CODES.QUESTION_NOT_FOUND]: 'Questão não encontrada',
  [ERROR_CODES.QUESTION_ALREADY_EXISTS]: 'Questão já existe',
  
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Erro interno do servidor',
  [ERROR_CODES.NOT_FOUND]: 'Recurso não encontrado',
  [ERROR_CODES.BAD_REQUEST]: 'Requisição inválida',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Erro desconhecido',
} as const;

// Função para criar erro padronizado
export function createError(
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: any,
  statusCode?: number
): AppError {
  const errorCode = ERROR_CODES[code];
  const errorMessage = message || ERROR_MESSAGES[errorCode] || 'Erro desconhecido';
  const errorStatusCode = statusCode || getDefaultStatusCode(errorCode);
  
  return new AppError(errorMessage, errorCode, errorStatusCode, details);
}

// Função para obter status code padrão
function getDefaultStatusCode(code: string): number {
  if (code.startsWith('AUTH_')) return 401;
  if (code.startsWith('VALIDATION_')) return 400;
  if (code.startsWith('API_')) return 503;
  if (code.startsWith('DATABASE_')) return 500;
  if (code === ERROR_CODES.USER_NOT_FOUND || code === ERROR_CODES.QUESTION_NOT_FOUND) return 404;
  if (code === ERROR_CODES.USER_ALREADY_EXISTS || code === ERROR_CODES.QUESTION_ALREADY_EXISTS) return 409;
  if (code === ERROR_CODES.BAD_REQUEST) return 400;
  if (code === ERROR_CODES.NOT_FOUND) return 404;
  if (code === ERROR_CODES.INTERNAL_SERVER_ERROR) return 500;
  return 500;
}

// Função para formatar erro para resposta da API
export function formatErrorResponse(error: AppError): ErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    },
    message: error.message,
  };
}

// Função para tratar erros de fetch
export function handleFetchError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error.name === 'AbortError') {
    return createError('API_TIMEOUT', 'Timeout da requisição');
  }
  
  if (error.message?.includes('Failed to fetch')) {
    return createError('API_NETWORK_ERROR', 'Erro de conexão');
  }
  
  if (error.message?.includes('HTTP error')) {
    const statusMatch = error.message.match(/status: (\d+)/);
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    
    if (status === 401) return createError('AUTH_UNAUTHORIZED');
    if (status === 403) return createError('AUTH_FORBIDDEN');
    if (status === 404) return createError('NOT_FOUND');
    if (status === 429) return createError('API_RATE_LIMITED');
    if (status >= 500) return createError('API_BACKEND_UNAVAILABLE');
    
    return createError('BAD_REQUEST', error.message, null, status);
  }
  
  return createError('UNKNOWN_ERROR', error.message || 'Erro desconhecido');
}

// Função para log de erros
export function logError(error: AppError, context?: string) {
  const logData = {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack,
  };
  
  console.error('🚨 Error logged:', logData);
  
  // Em produção, enviar para serviço de monitoramento
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrar com Sentry, LogRocket, etc.
    console.error('Production error:', logData);
  }
}
