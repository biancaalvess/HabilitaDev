import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { databaseService } from '@/lib/database-simple';
import { config, validateConfig } from '@/lib/config-simple';
import { 
  createSuccessResponse, 
  handleApiError, 
  validateRequired,
  validatePassword,
  sanitizeInput 
} from '@/lib/api-response';
import { createError, ERROR_CODES } from '@/lib/error-handler';

validateConfig();

export async function POST(request: NextRequest) {
  try {
    await databaseService.connect();
    
    const rawData = await request.json();
    const { token, password } = sanitizeInput(rawData);

    validateRequired({ token, password }, ['token', 'password']);
    validatePassword(password, 6);

    const tokenData = await databaseService.getPasswordResetToken(token);
    
    if (!tokenData) {
      throw createError('AUTH_TOKEN_INVALID', 'Token de redefinição inválido');
    }

    if (tokenData.used) {
      throw createError('AUTH_TOKEN_INVALID', 'Token já foi utilizado');
    }

    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      throw createError('AUTH_TOKEN_EXPIRED', 'Token de redefinição expirado');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, config.auth.bcryptRounds);

    // Atualizar senha do usuário
    await databaseService.updateUser(tokenData.user_id, { password: hashedPassword });

    // Marcar token como usado
    await databaseService.markPasswordResetTokenAsUsed(token);

    return createSuccessResponse(
      { reset: true },
      'Senha redefinida com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/auth/reset-password');
  }
}

