import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { databaseService } from '@/lib/database';
import { config, validateConfig } from '@/lib/config';

// Validar configurações na inicialização
validateConfig();

export async function POST(request: NextRequest) {
  try {
    // Conectar ao banco de dados
    await databaseService.connect();
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as any;
      
      // Buscar usuário atualizado no banco
      const user = await databaseService.getUserById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      // Retornar dados do usuário (sem senha)
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      });

    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
