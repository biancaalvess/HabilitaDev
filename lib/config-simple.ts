// Spring: BACKEND_URL → NEXT_PUBLIC_API_URL (http) → NEXT_PUBLIC_BACKEND_URL. Cliente: resolveNextClientApiBase + /proxy/...

function normalizeBackendBase(url: string): string {
  if (!url) return ''
  return url.replace(/\/+$/, '')
}

function isRemoteHttpUrl(value: string | undefined): boolean {
  return !!value && /^https?:\/\//i.test(value.trim())
}

export function resolveJavaApiBaseUrl(): string {
  const serverOnly = process.env.BACKEND_URL?.trim()
  if (serverOnly && isRemoteHttpUrl(serverOnly)) {
    return normalizeBackendBase(serverOnly)
  }
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (isRemoteHttpUrl(pub)) {
    return normalizeBackendBase(pub!)
  }
  return normalizeBackendBase(
    (process.env.NEXT_PUBLIC_BACKEND_URL || '').trim()
  )
}

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

/** Resposta JSON quando não há URL do Java (ex.: env em falta na Vercel). */
export function missingJavaBackendJson() {
  return {
    error: 'Service Unavailable',
    code: 'JAVA_BACKEND_URL_MISSING',
    message: 'URL do backend Spring não está configurada neste ambiente.',
    hint:
      'Defina BACKEND_URL=https://… (recomendado, só no servidor) ou NEXT_PUBLIC_BACKEND_URL ou NEXT_PUBLIC_API_URL com URL http(s) completa do Java. Na Vercel: Settings → Environment Variables → Production → Save → Redeploy.',
  } as const
}

export const config = {
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'xm9enPt2Gi3QYuiMalZ4CtlHB0p4rRtk6ThJt93CUcI=',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  },

  api: {
    baseUrl: resolveNextClientApiBase(),
    backendUrl: resolveJavaApiBaseUrl(),
    timeout: 30000,
  },

  validateProductionConfig() {
    const nodeEnv = process.env.NODE_ENV || 'development';

    if (nodeEnv === 'production') {
      const backendUrl = resolveJavaApiBaseUrl();

      if (!backendUrl) {
        console.error(
          '❌ ERRO CRÍTICO: URL do backend Java em falta. Defina BACKEND_URL (servidor), NEXT_PUBLIC_API_URL (https://...) ou NEXT_PUBLIC_BACKEND_URL em produção.'
        );
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

  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    provider: process.env.MONITORING_PROVIDER || 'none',
  },

  development: {
    nodeEnv: process.env.NODE_ENV || 'development',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'HabilitaDev',
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'console',
    fromEmail: process.env.FROM_EMAIL || 'noreply@habilitadev.com',
    fromName: process.env.FROM_NAME || 'HabilitaDev',
    resendApiKey: process.env.RESEND_API_KEY || '',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  },
} as const;

export function validateConfig() {
  const errors: string[] = [];

  const defaultSecrets = [
    "your-super-secret-jwt-key-change-in-production",
    "your-super-secret-jwt-key-for-development",
  ];
  if (defaultSecrets.includes(config.auth.jwtSecret)) {
    errors.push("JWT_SECRET deve ser alterado em produção");
  }

  if (config.development.nodeEnv === 'production' && !process.env.JWT_SECRET) {
    errors.push("JWT_SECRET é obrigatório em produção");
  }

  if (config.auth.bcryptRounds < 10) {
    errors.push("BCRYPT_ROUNDS deve ser pelo menos 10");
  }

  if (config.development.nodeEnv === 'production') {
    const isValid = config.validateProductionConfig();
    if (!isValid) {
      errors.push(
        'Configuração de produção inválida — verifique BACKEND_URL, NEXT_PUBLIC_API_URL ou NEXT_PUBLIC_BACKEND_URL (Java)'
      );
    }
  }

  if (errors.length > 0) {
    console.warn("⚠️ Configurações de segurança:", errors.join(", "));
  }

  return errors;
}
