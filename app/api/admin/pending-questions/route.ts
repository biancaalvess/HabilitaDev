import { NextRequest } from 'next/server';
import { databaseService } from '@/lib/database-simple';
import { validateConfig } from '@/lib/config-simple';
import { 
  createSuccessResponse, 
  handleApiError 
} from '@/lib/api-response';

validateConfig();

export async function GET(request: NextRequest) {
  try {
    await databaseService.connect();
    
    const questions = await databaseService.getPendingQuestions();
    
    return createSuccessResponse(
      questions,
      'Questões pendentes obtidas com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/pending-questions');
  }
}

