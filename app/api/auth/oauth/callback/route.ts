import { NextRequest, NextResponse } from 'next/server';
import { config, validateConfig } from '@/lib/config-simple';

// Forçar rota dinâmica (não pode ser pré-renderizada estaticamente)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validar configurações na inicialização
validateConfig();

// Nome do cookie de autenticação
const AUTH_COOKIE_NAME = 'habilitadev_token';

// Função para calcular Max-Age em segundos
function getCookieMaxAge(): number {
  const expiresIn = config.auth.jwtExpiresIn;
  if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn.replace('d', ''));
    return days * 24 * 60 * 60;
  } else if (expiresIn.endsWith('h')) {
    const hours = parseInt(expiresIn.replace('h', ''));
    return hours * 60 * 60;
  } else if (expiresIn.endsWith('m')) {
    const minutes = parseInt(expiresIn.replace('m', ''));
    return minutes * 60;
  }
  return 7 * 24 * 60 * 60; // Default: 7 dias
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const returnUrl = searchParams.get('return_url') || '/';

    // Verificar se há erro
    if (error) {
      // Redirecionar para página de erro
      const errorUrl = new URL('/auth/callback', request.url);
      errorUrl.searchParams.set('error', error);
      if (errorDescription) {
        errorUrl.searchParams.set('error_description', errorDescription);
      }
      return NextResponse.redirect(errorUrl.toString());
    }

    // Verificar se temos token
    if (!accessToken) {
      const errorUrl = new URL('/auth/callback', request.url);
      errorUrl.searchParams.set('error', 'missing_token');
      errorUrl.searchParams.set('error_description', 'Token não recebido');
      return NextResponse.redirect(errorUrl.toString());
    }

    // Criar resposta de redirecionamento
    // Redirecionar de volta para /auth/callback sem tokens para verificar a sessão
    const callbackUrl = new URL('/auth/callback', request.url);
    if (returnUrl && returnUrl !== '/') {
      callbackUrl.searchParams.set('return_url', returnUrl);
    }
    const response = NextResponse.redirect(callbackUrl.toString());

    // Determinar se estamos em produção
    const isProduction = process.env.NODE_ENV === 'production';

    // Configurar cookie HttpOnly com o token
    response.cookies.set(AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: getCookieMaxAge(),
    });

    // Se houver refresh token, também podemos armazená-lo (opcional)
    // Por enquanto, vamos armazenar apenas o access token

    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorUrl = new URL('/auth/callback', request.url);
    errorUrl.searchParams.set('error', 'internal_error');
    errorUrl.searchParams.set('error_description', 'Erro ao processar callback OAuth');
    return NextResponse.redirect(errorUrl.toString());
  }
}

