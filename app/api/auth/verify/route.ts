import { NextRequest } from 'next/server';
import { databaseService } from '@/lib/database-simple';
import { config, validateConfig } from '@/lib/config-simple';
import { verifyJWT } from '@/lib/jwt-helper';
import { createSuccessResponse, handleApiError } from '@/lib/api-response';
import { createError, ERROR_CODES } from '@/lib/error-handler';

// Validar configurações na inicialização
validateConfig();

// Nome do cookie de autenticação
const AUTH_COOKIE_NAME = 'habilitadev_token';

export async function POST(request: NextRequest) {
  try {
    // Conectar ao banco de dados
    await databaseService.connect();
    
    // Tentar obter token do cookie primeiro (preferencial)
    let token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    
    // Fallback: tentar obter do header Authorization (para compatibilidade)
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer '
      }
    }
    
    if (!token) {
      throw createError('AUTH_UNAUTHORIZED', 'Token não fornecido');
    }

    try {
      const decoded = verifyJWT(token, config.auth.jwtSecret);
      
      // Buscar usuário atualizado no banco
      const user = await databaseService.getUserById(decoded.userId);
      if (!user) {
        throw createError('USER_NOT_FOUND');
      }

      // Retornar dados do usuário (sem senha)
      const { password: _, ...userWithoutPassword } = user;

      return createSuccessResponse(
        { user: userWithoutPassword },
        'Token verificado com sucesso',
        200,
        {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        }
      );

    } catch (jwtError) {
      if (jwtError instanceof Error && jwtError.name === 'TokenExpiredError') {
        throw createError('AUTH_TOKEN_EXPIRED');
      }
      throw createError('AUTH_TOKEN_INVALID');
    }

  } catch (error) {
    return handleApiError(error, 'POST /api/auth/verify');
  }
}
