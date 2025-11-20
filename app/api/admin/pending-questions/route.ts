import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  handleApiError 
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Banco de dados removido - retornar array vazio
    return createSuccessResponse(
      [],
      'Questões pendentes obtidas com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/pending-questions');
  }
}
