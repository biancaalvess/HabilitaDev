import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  handleApiError 
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const stats = {
      totalUsers: 0,
      totalQuestions: 0,
      pendingQuestions: 0,
      approvedQuestions: 0,
      totalFeedback: 0,
      totalAnswers: 0,
    };
    
    return createSuccessResponse(
      stats,
      'Estatísticas obtidas com sucesso',
      200
    );
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/stats');
  }
}
