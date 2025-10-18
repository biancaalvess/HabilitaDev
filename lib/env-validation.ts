import { z } from 'zod';

// Schema de validação para variáveis de ambiente
const envSchema = z.object({
  // Configurações de ambiente
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Configurações de banco de dados
  DATABASE_URL: z.string().default('file:./dev.db'),
  
  // Configurações de autenticação
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(10),
  
  // Configurações da API
  NEXT_PUBLIC_API_URL: z.string().default('/api/v1'),
  BACKEND_URL: z.string().url().default('https://habilitadev-backend.onrender.com'),
  
  // Configurações de desenvolvimento
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('HabilitaDev'),
  
  // Configurações de segurança
  RATE_LIMIT_MAX: z.coerce.number().min(1).max(1000).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().min(1000).default(900000),
  
  // Configurações de cache
  CACHE_TTL: z.coerce.number().min(1000).default(300000),
  CACHE_MAX_SIZE: z.coerce.number().min(10).default(100),
  
  // Configurações de log
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('text'),
  
  // Configurações de monitoramento
  ENABLE_ANALYTICS: z.coerce.boolean().default(true),
  ENABLE_ERROR_REPORTING: z.coerce.boolean().default(true),
});

// Função para validar e carregar variáveis de ambiente
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return { success: true, data: env, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      console.error('❌ Erro de validação de variáveis de ambiente:');
      errorMessages.forEach(msg => console.error(`  - ${msg}`));
      
      return { 
        success: false, 
        data: null, 
        error: errorMessages.join(', ') 
      };
    }
    
    return { 
      success: false, 
      data: null, 
      error: 'Erro desconhecido na validação de ambiente' 
    };
  }
}

// Carregar e validar variáveis de ambiente
const envResult = validateEnv();

if (!envResult.success) {
  console.error('❌ Falha na validação de variáveis de ambiente:', envResult.error);
  process.exit(1);
}

export const env = envResult.data!;

// Função para verificar se está em produção
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Função para obter configurações de log
export const getLogConfig = () => ({
  level: env.LOG_LEVEL,
  format: env.LOG_FORMAT,
  enableConsole: isDevelopment,
});

// Função para obter configurações de cache
export const getCacheConfig = () => ({
  ttl: env.CACHE_TTL,
  maxSize: env.CACHE_MAX_SIZE,
});

// Função para obter configurações de rate limiting
export const getRateLimitConfig = () => ({
  max: env.RATE_LIMIT_MAX,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
});

// Função para obter configurações de monitoramento
export const getMonitoringConfig = () => ({
  enableAnalytics: env.ENABLE_ANALYTICS,
  enableErrorReporting: env.ENABLE_ERROR_REPORTING,
});
