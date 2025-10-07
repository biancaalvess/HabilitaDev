import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Em uma implementação real, você invalidaria o token no servidor
    // Por enquanto, apenas retornamos sucesso
    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
