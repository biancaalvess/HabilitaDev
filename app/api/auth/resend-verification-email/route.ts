import { NextRequest } from 'next/server';
import { databaseService } from '@/lib/database-simple';
import { config, validateConfig } from '@/lib/config-simple';
import { emailService } from '@/lib/email-service';
import { getVerificationEmailTemplate } from '@/lib/email-templates';
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
        'Se o email estiver cadastrado, você receberá um email de verificação',
        200
      );
    }

    // Gerar novo token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expira em 24 horas

    await databaseService.createEmailVerificationToken(user.id, token, expiresAt);

    // Enviar email
    const emailTemplate = getVerificationEmailTemplate(token, user.username);
    await emailService.sendEmail({
      to: user.email,
      subject: 'Verifique seu email - HabilitaDev',
      html: emailTemplate,
    });

    return createSuccessResponse(
      { sent: true },
      'Email de verificação enviado com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'POST /api/auth/resend-verification-email');
  }
}

