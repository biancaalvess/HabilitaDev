import { NextRequest } from 'next/server';
import { databaseService } from '@/lib/database-simple';
import { config, validateConfig } from '@/lib/config-simple';
import { emailService } from '@/lib/email-service';
import { getPasswordResetEmailTemplate } from '@/lib/email-templates';
import { 
  createSuccessResponse, 
  handleApiError, 
  validateRequired,
  validateEmail,
  sanitizeInput 
} from '@/lib/api-response';
import { createError, ERROR_CODES } from '@/lib/error-handler';
import * as crypto from 'crypto';

validateConfig();

export async function POST(request: NextRequest) {
  try {
    await databaseService.connect();
    
    const rawData = await request.json();
    const { email } = sanitizeInput(rawData);

    validateRequired({ email }, ['email']);
    validateEmail(email);

    const user = await databaseService.getUserByEmail(email);
    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return createSuccessResponse(
        { sent: true },
        'Se o email estiver cadastrado, você receberá um email com instruções para redefinir sua senha',
        200
      );
    }

    // Gerar token de reset
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora

    await databaseService.createPasswordResetToken(user.id, token, expiresAt);

    // Enviar email
    const emailTemplate = getPasswordResetEmailTemplate(token, user.username);
    await emailService.sendEmail({
      to: user.email,
      subject: 'Redefinir senha - HabilitaDev',
      html: emailTemplate,
    });

    return createSuccessResponse(
      { sent: true },
      'Email de recuperação de senha enviado com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/auth/forgot-password');
  }
}

