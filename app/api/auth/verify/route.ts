import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { databaseService } from '@/lib/database';
import { config, validateConfig } from '@/lib/config';
import { createSuccessResponse, handleApiError } from '@/lib/api-response';
import { createError, ERROR_CODES } from '@/lib/error-handler';

// Validar configurações na inicialização
validateConfig();

export async function POST(request: NextRequest) {
  try {
    // Conectar ao banco de dados
    await databaseService.connect();
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('AUTH_UNAUTHORIZED', 'Token não fornecido');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as any;
      
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
