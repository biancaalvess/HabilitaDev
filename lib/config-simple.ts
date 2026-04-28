// Configuração simples sem validação Zod
//
// Integração Spring Boot (JSON snake_case em /api/v1/...):
// - URL pública do Java: use NEXT_PUBLIC_API_URL=https://... (sem barra no fim) — preferido no spec.
//   Se NEXT_PUBLIC_API_URL for um path (ex. /api), o Java fica em NEXT_PUBLIC_BACKEND_URL ou BACKEND_URL.
// - O browser chama o Next em `baseUrl` + /proxy/...; as Route Handlers fazem fetch a `backendUrl` + /api/v1/...
// - Não envie Authorization (API pública actual). CORS: configurar no Render (CORS_ALLOWED_ORIGINS).

/** URL do backend Java. Sem barra no fim. */
function normalizeBackendBase(url: string): string {
  if (!url) return ''
  return url.replace(/\/+$/, '')
}

function isRemoteHttpUrl(value: string | undefined): boolean {
  return !!value && /^https?:\/\//i.test(value.trim())
}

/** Base do Java (Render). Ordem: NEXT_PUBLIC_API_URL se for https?://, senão NEXT_PUBLIC_BACKEND_URL, senão BACKEND_URL. */
export function resolveJavaApiBaseUrl(): string {
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (isRemoteHttpUrl(pub)) {
    return normalizeBackendBase(pub!)
  }
  return normalizeBackendBase(
    (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '').trim()
  )
}

/** Prefixo das rotas Next usadas pelo cliente (ex. /api → /api/proxy/...). Se NEXT_PUBLIC_API_URL for URL do Java, usa NEXT_PUBLIC_APP_API_BASE ou /api. */
export function resolveNextClientApiBase(): string {
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (pub && !isRemoteHttpUrl(pub)) {
    return (pub.replace(/\/+$/, '') || '/api')
  }
  const explicit = process.env.NEXT_PUBLIC_APP_API_BASE?.trim()
  if (explicit) {
    return explicit.replace(/\/+$/, '') || '/api'
  }
  return '/api'
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
    /** Base para fetch do browser → Next (BFF). Não confundir com a URL do Java. */
    baseUrl: resolveNextClientApiBase(),
    /** Base do Spring Boot: GET ${backendUrl}/health, GET ${backendUrl}/api/v1/questions, etc. */
    backendUrl: resolveJavaApiBaseUrl(),
    timeout: 30000, // 30 segundos
  },
  
  // Validação de configuração de produção
  validateProductionConfig() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'production') {
      const backendUrl = resolveJavaApiBaseUrl();
      
      if (!backendUrl) {
        console.error('❌ ERRO CRÍTICO: URL do backend Java em falta. Defina NEXT_PUBLIC_API_URL=https://... ou NEXT_PUBLIC_BACKEND_URL em produção.');
        return false;
      }
      
      if (!backendUrl.startsWith('https://')) {
        console.warn('⚠️ AVISO: A URL do backend Java deve usar HTTPS em produção.');
      }
      
      if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
        console.error('❌ ERRO CRÍTICO: o backend Java em produção não pode apontar para localhost.');
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
      errors.push("Configuração de produção inválida - verifique NEXT_PUBLIC_API_URL (Java) ou NEXT_PUBLIC_BACKEND_URL");
    }
  }
  
  if (errors.length > 0) {
    console.warn("⚠️ Configurações de segurança:", errors.join(", "));
  }
  
  return errors;
}
