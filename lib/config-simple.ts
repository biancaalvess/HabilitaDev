// Configuração simples sem validação Zod

/** URL do backend Java (Render). Sem barra no fim. Usada só nas API Routes (servidor) → fetch(`${backendUrl}/api/v1/...`). */
function normalizeBackendBase(url: string): string {
  if (!url) return ''
  return url.replace(/\/+$/, '')
}

export const config = {
  // Configurações de Autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'xm9enPt2Gi3QYuiMalZ4CtlHB0p4rRtk6ThJt93CUcI=',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  },
  
  // Configurações da API
  api: {
    baseUrl: (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '') || '/api',
    backendUrl: normalizeBackendBase(
      process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || ''
    ),
    timeout: 30000, // 30 segundos
  },
  
  // Validação de configuração de produção
  validateProductionConfig() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'production') {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
      
      if (!backendUrl) {
        console.error('❌ ERRO CRÍTICO: NEXT_PUBLIC_BACKEND_URL não está configurado em produção!');
        return false;
      }
      
      // Verificar se a URL é HTTPS em produção
      if (!backendUrl.startsWith('https://')) {
        console.warn('⚠️ AVISO: NEXT_PUBLIC_BACKEND_URL deve usar HTTPS em produção!');
      }
      
      // Verificar se não está usando localhost em produção
      if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
        console.error('❌ ERRO CRÍTICO: NEXT_PUBLIC_BACKEND_URL não pode apontar para localhost em produção!');
        return false;
      }
    }
    
    return true;
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
  
  // Configurações de Email
  email: {
    provider: process.env.EMAIL_PROVIDER || 'console', // 'resend', 'sendgrid', 'console'
    fromEmail: process.env.FROM_EMAIL || 'noreply@habilitadev.com',
    fromName: process.env.FROM_NAME || 'HabilitaDev',
    // Resend
    resendApiKey: process.env.RESEND_API_KEY || '',
    // SendGrid
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  },
} as const;

// Validação de configurações críticas
export function validateConfig() {
  const errors: string[] = [];
  
  // Verificar se JWT_SECRET está usando fallback inseguro
  const defaultSecrets = [
    "your-super-secret-jwt-key-change-in-production",
    "your-super-secret-jwt-key-for-development",
  ];
  if (defaultSecrets.includes(config.auth.jwtSecret)) {
    errors.push("JWT_SECRET deve ser alterado em produção");
  }
  
  // Em produção, JWT_SECRET deve ser fornecido
  if (config.development.nodeEnv === 'production' && !process.env.JWT_SECRET) {
    errors.push("JWT_SECRET é obrigatório em produção");
  }
  
  if (config.auth.bcryptRounds < 10) {
    errors.push("BCRYPT_ROUNDS deve ser pelo menos 10");
  }
  
  // Validar configuração de produção
  if (config.development.nodeEnv === 'production') {
    const isValid = config.validateProductionConfig();
    if (!isValid) {
      errors.push("Configuração de produção inválida - verifique NEXT_PUBLIC_BACKEND_URL");
    }
  }
  
  if (errors.length > 0) {
    console.warn("⚠️ Configurações de segurança:", errors.join(", "));
  }
  
  return errors;
}
