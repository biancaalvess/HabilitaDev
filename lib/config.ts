import { env, getLogConfig, getCacheConfig, getRateLimitConfig, getMonitoringConfig } from './env-validation';

// Configurações centralizadas da aplicação
export const config = {
  // Configurações de Banco de Dados
  database: {
    url: env.DATABASE_URL,
  },
  
  // Configurações de Autenticação
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    bcryptRounds: env.BCRYPT_ROUNDS,
  },
  
  // Configurações da API
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
    backendUrl: env.BACKEND_URL,
    timeout: 30000, // 30 segundos
  },
  
  // Configurações de Rate Limiting
  rateLimit: getRateLimitConfig(),
  
  // Configurações de Cache
  cache: getCacheConfig(),
  
  // Configurações de Log
  log: getLogConfig(),
  
  // Configurações de Monitoramento
  monitoring: getMonitoringConfig(),
  
  // Configurações de Desenvolvimento
  development: {
    nodeEnv: env.NODE_ENV,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    appName: env.NEXT_PUBLIC_APP_NAME,
  },
} as const;

// Validação de configurações críticas
export function validateConfig() {
  const errors: string[] = [];
  
  if (config.auth.jwtSecret === "your-super-secret-jwt-key-change-in-production") {
    errors.push("JWT_SECRET deve ser alterado em produção");
  }
  
  if (config.auth.bcryptRounds < 10) {
    errors.push("BCRYPT_ROUNDS deve ser pelo menos 10");
  }
  
  if (config.development.nodeEnv === 'production' && config.database.url.includes('dev.db')) {
    errors.push("DATABASE_URL não deve usar arquivo de desenvolvimento em produção");
  }
  
  if (errors.length > 0) {
    console.warn("⚠️ Configurações de segurança:", errors.join(", "));
  }
  
  return errors;
}
