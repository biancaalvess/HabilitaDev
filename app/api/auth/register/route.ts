import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseService } from '@/lib/database';
import { config, validateConfig } from '@/lib/config';

// Validar configurações na inicialização
validateConfig();

export async function POST(request: NextRequest) {
  try {
    // Conectar ao banco de dados
    await databaseService.connect();
    
    const { username, email, password } = await request.json();

    // Validações básicas
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const existingUser = await databaseService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuário já existe com este email' },
        { status: 409 }
      );
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

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
