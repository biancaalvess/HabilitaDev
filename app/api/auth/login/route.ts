import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { databaseService } from '@/lib/database-simple';
import { config, validateConfig } from '@/lib/config-simple';
import { generateJWT } from '@/lib/jwt-helper';
import { 
  createSuccessResponse, 
  handleApiError, 
  validateRequired, 
  validateEmail,
  sanitizeInput 
} from '@/lib/api-response';
import { createError, ERROR_CODES } from '@/lib/error-handler';

// Validar configurações na inicialização
validateConfig();

// Nome do cookie de autenticação
const AUTH_COOKIE_NAME = 'habilitadev_token';

// Função para calcular Max-Age em segundos (7 dias)
function getCookieMaxAge(): number {
  // Converter jwtExpiresIn (ex: "1d", "7d") para segundos
  const expiresIn = config.auth.jwtExpiresIn;
  if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn.replace('d', ''));
    return days * 24 * 60 * 60; // dias * horas * minutos * segundos
  } else if (expiresIn.endsWith('h')) {
    const hours = parseInt(expiresIn.replace('h', ''));
    return hours * 60 * 60; // horas * minutos * segundos
  } else if (expiresIn.endsWith('m')) {
    const minutes = parseInt(expiresIn.replace('m', ''));
    return minutes * 60; // minutos * segundos
  }
  // Default: 7 dias
  return 7 * 24 * 60 * 60;
}

export async function POST(request: NextRequest) {
  try {
    // Conectar ao banco de dados
    await databaseService.connect();
    
    // Obter e sanitizar dados
    const rawData = await request.json();
    const { email, password } = sanitizeInput(rawData);

    // Validar dados obrigatórios
    validateRequired({ email, password }, ['email', 'password']);
    
    // Validar formato do email
    validateEmail(email);

    // Buscar usuário no banco
    const user = await databaseService.getUserByEmail(email);
    if (!user) {
      throw createError('AUTH_INVALID_CREDENTIALS');
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError('AUTH_INVALID_CREDENTIALS');
    }

    // Gerar token JWT
    const token = generateJWT(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.auth.jwtSecret,
      config.auth.jwtExpiresIn
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    // Criar resposta de sucesso (já retorna NextResponse)
    const response = createSuccessResponse(
      {
        user: userWithoutPassword,
      },
      'Login realizado com sucesso',
      200,
      {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      }
    );

    // Determinar se estamos em produção
    const isProduction = process.env.NODE_ENV === 'production';

    // Configurar cookie HttpOnly
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction, // Apenas HTTPS em produção
      sameSite: 'lax', // Proteção contra CSRF
      path: '/',
      maxAge: getCookieMaxAge(),
    });

    return response;

  } catch (error) {
    return handleApiError(error, 'POST /api/auth/login');
  }
}
