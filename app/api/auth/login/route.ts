import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseService } from '@/lib/database';
import { config, validateConfig } from '@/lib/config';
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
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    return createSuccessResponse(
      {
        user: userWithoutPassword,
        token,
      },
      'Login realizado com sucesso',
      200,
      {
        requestId: crypto.randomUUID(),
      }
    );

  } catch (error) {
    return handleApiError(error, 'POST /api/auth/login');
  }
}
