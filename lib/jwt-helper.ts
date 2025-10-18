import jwt from 'jsonwebtoken';

// Helper para gerar tokens JWT com tipagem correta
export function generateJWT(payload: any, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { expiresIn } as any);
}

// Helper para verificar tokens JWT
export function verifyJWT(token: string, secret: string): any {
  return jwt.verify(token, secret);
}
