// Configuração simples sem validação Zod
export const config = {
  // Configurações de Banco de Dados
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  
  // Configurações de Autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'xm9enPt2Gi3QYuiMalZ4CtlHB0p4rRtk6ThJt93CUcI=',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  },
  
  // Configurações da API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    backendUrl: process.env.BACKEND_URL || 'https://habilitadev-backend.onrender.com',
    timeout: 30000, // 30 segundos
  },
  
  // Configurações de Rate Limiting
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  // Configurações de Cache
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
  },
  
  // Configurações de Log
  log: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
  
  // Configurações de Monitoramento
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    provider: process.env.MONITORING_PROVIDER || 'none',
  },
  
  // Configurações de Desenvolvimento
  development: {
    nodeEnv: process.env.NODE_ENV || 'development',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'HabilitaDev',
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
