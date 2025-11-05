import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { databaseService } from '@/lib/database-simple';
import { config, validateConfig } from '@/lib/config-simple';
import { generateJWT } from '@/lib/jwt-helper';
import { emailService } from '@/lib/email-service';
import { getVerificationEmailTemplate } from '@/lib/email-templates';
import { 
  createSuccessResponse, 
  handleApiError, 
  validateRequired, 
  validateEmail,
  validatePassword,
  sanitizeInput 
} from '@/lib/api-response';
import { createError, ERROR_CODES } from '@/lib/error-handler';

// Validar configurações na inicialização
validateConfig();

export async function POST(request: NextRequest) {
  try {
    // Conectar ao banco de dados
    await databaseService.connect();
    
    // Obter e sanitizar dados
    const rawData = await request.json();
    const { username, email, password } = sanitizeInput(rawData);

    // Validar dados obrigatórios
    validateRequired({ username, email, password }, ['username', 'email', 'password']);
    
    // Validar formato do email
    validateEmail(email);
    
    // Validar senha
    validatePassword(password, 6);

    // Verificar se usuário já existe
    const existingUser = await databaseService.getUserByEmail(email);
    if (existingUser) {
      throw createError('USER_ALREADY_EXISTS');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, config.auth.bcryptRounds);

    // Criar novo usuário
    const newUser = await databaseService.createUser({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // Gerar token de verificação de email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expira em 24 horas

    await databaseService.createEmailVerificationToken(newUser.id, verificationToken, expiresAt);

    // Enviar email de verificação
    try {
      const emailTemplate = getVerificationEmailTemplate(verificationToken, newUser.username);
      await emailService.sendEmail({
        to: newUser.email,
        subject: 'Verifique seu email - HabilitaDev',
        html: emailTemplate,
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de verificação:', emailError);
      // Não falhar o registro se o email não for enviado
    }

    // Gerar token JWT
    const token = generateJWT(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      config.auth.jwtSecret,
      config.auth.jwtExpiresIn
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = newUser;

    return createSuccessResponse(
      {
        user: userWithoutPassword,
        token,
        email_verification_required: true,
      },
      'Conta criada com sucesso! Verifique seu email para confirmar sua conta.',
      201,
      {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      }
    );

  } catch (error) {
    return handleApiError(error, 'POST /api/auth/register');
  }
}
