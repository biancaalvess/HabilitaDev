import { NextRequest } from 'next/server';
import { databaseService } from '@/lib/database-simple';
import { config, validateConfig } from '@/lib/config-simple';
import { 
  createSuccessResponse, 
  handleApiError, 
  validateRequired,
  sanitizeInput 
} from '@/lib/api-response';
import { createError, ERROR_CODES } from '@/lib/error-handler';

validateConfig();

export async function GET(request: NextRequest) {
  try {
    await databaseService.connect();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const redirectUrl = searchParams.get('redirect_url') || `${config.development.appUrl}/questoes`;

    if (!token) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${redirectUrl}?error=token_required`,
        },
      });
    }

    const tokenData = await databaseService.getEmailVerificationToken(token);
    
    if (!tokenData) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${redirectUrl}?error=invalid_token`,
        },
      });
    }

    if (tokenData.used) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${redirectUrl}?error=token_already_used`,
        },
      });
    }

    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${redirectUrl}?error=token_expired`,
        },
      });
    }

    // Marcar token como usado e atualizar usuário (se necessário)
    await databaseService.markEmailVerificationTokenAsUsed(token);
    
    // Nota: Aqui você pode adicionar lógica para marcar o email como verificado no usuário
    // Por exemplo, adicionar uma coluna email_verified na tabela users

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${redirectUrl}?verified=true`,
      },
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/auth/verify-email');
  }
}

export async function POST(request: NextRequest) {
  try {
    await databaseService.connect();
    
    const rawData = await request.json();
    const { token } = sanitizeInput(rawData);

    validateRequired({ token }, ['token']);

    const tokenData = await databaseService.getEmailVerificationToken(token);
    
    if (!tokenData) {
      throw createError('AUTH_TOKEN_INVALID', 'Token de verificação inválido');
    }

    if (tokenData.used) {
      throw createError('AUTH_TOKEN_INVALID', 'Token já foi utilizado');
    }

    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      throw createError('AUTH_TOKEN_EXPIRED', 'Token de verificação expirado');
    }

    await databaseService.markEmailVerificationTokenAsUsed(token);

    return createSuccessResponse(
      { verified: true },
      'Email verificado com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/auth/verify-email');
  }
}

