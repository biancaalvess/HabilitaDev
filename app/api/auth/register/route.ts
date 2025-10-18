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

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = newUser;

    return createSuccessResponse(
      {
        user: userWithoutPassword,
        token,
      },
      'Usuário criado com sucesso',
      201,
      {
        requestId: crypto.randomUUID(),
      }
    );

  } catch (error) {
    return handleApiError(error, 'POST /api/auth/register');
  }
}
