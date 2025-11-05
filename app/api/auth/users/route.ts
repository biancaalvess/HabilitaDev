import { NextRequest } from 'next/server';
import { databaseService } from '@/lib/database-simple';
import { validateConfig } from '@/lib/config-simple';
import { 
  createSuccessResponse, 
  handleApiError, 
  validateRequired,
  sanitizeInput 
} from '@/lib/api-response';
import { createError, ERROR_CODES } from '@/lib/error-handler';

validateConfig();

// GET - Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    await databaseService.connect();
    
    const users = await databaseService.getAllUsers();
    
    // Remover senhas dos usuários
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    return createSuccessResponse(
      usersWithoutPasswords,
      'Usuários listados com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'GET /api/auth/users');
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    await databaseService.connect();
    
    const rawData = await request.json();
    const { id, ...userData } = sanitizeInput(rawData);

    validateRequired({ id }, ['id']);

    const updatedUser = await databaseService.updateUser(id, userData);
    const { password, ...userWithoutPassword } = updatedUser;

    return createSuccessResponse(
      userWithoutPassword,
      'Usuário atualizado com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'PUT /api/auth/users');
  }
}

// DELETE - Deletar usuário
export async function DELETE(request: NextRequest) {
  try {
    await databaseService.connect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw createError('VALIDATION_ERROR', 'ID do usuário é obrigatório');
    }

    await databaseService.deleteUser(parseInt(id));

    return createSuccessResponse(
      { deleted: true },
      'Usuário deletado com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'DELETE /api/auth/users');
  }
}

