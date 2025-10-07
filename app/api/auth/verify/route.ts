import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Simulando um banco de dados em memória (em produção, use um banco real)
const users: Array<{
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}> = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@habilitadev.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
  }
];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Buscar usuário atualizado
      const user = users.find(u => u.id === decoded.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user,
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
