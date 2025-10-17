// Configurações centralizadas da aplicação
export const config = {
  // Configurações de Banco de Dados
  database: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
  
  // Configurações de Autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "10"),
  },
  
  // Configurações da API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
    backendUrl: process.env.BACKEND_URL || "https://habilitadev-backend.onrender.com",
    timeout: 30000, // 30 segundos
  },
  
  // Configurações de Rate Limiting
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutos
  },
  
  // Configurações de Desenvolvimento
  development: {
    nodeEnv: process.env.NODE_ENV || "development",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
  
  if (errors.length > 0) {
    console.warn("⚠️ Configurações de segurança:", errors.join(", "));
  }
  
  return errors;
}
