import { NextRequest, NextResponse } from 'next/server';

// Nome do cookie de autenticação
const AUTH_COOKIE_NAME = 'habilitadev_token';

export async function POST(request: NextRequest) {
  try {
    // Criar resposta de sucesso
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });

    // Limpar cookie de autenticação
    // Configurar cookie com Max-Age: -1 para expirar imediatamente
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: -1, // Expirar imediatamente
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
