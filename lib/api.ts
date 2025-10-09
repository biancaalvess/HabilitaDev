// ✅ SOLUÇÃO ALTERNATIVA: Usar rewrites do Next.js (mais eficiente)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/backend';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'algorithms' | 'data_structures' | 'system_design' | 'databases' | 'frontend' | 'backend' | 'devops';
  company?: string;
  tags?: string[];
  created_at: string;
  approved: boolean;
}

export interface Answer {
  id: number;
  question_id: number;
  author_name: string;
  content: string;
  created_at: string;
  is_solution: boolean;
}

export interface Comment {
  id: number;
  question_id: number;
  author_name: string;
  comment_type: 'correction' | 'suggestion';
  content: string;
  created_at: string;
}

export interface Feedback {
  id: number;
  question_id: number;
  user_id?: number;
  feedback_type: 'correction' | 'suggestion' | 'improvement';
  content: string;
  status: 'pending' | 'reviewed' | 'implemented';
  created_at: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log('🔍 Fetching from:', url); // Debug para ver URL exata
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data); // Debug para ver resposta
      
      // ✅ CORREÇÃO: Backend retorna array direto, mas frontend espera ApiResponse<T>
      if (Array.isArray(data)) {
        // Se é um array direto (como questions), envolver em ApiResponse
        return {
          success: true,
          data: data,
          message: 'Success'
        };
      }
      
      // Se já é um objeto com success/data, retornar como está
      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Questions endpoints - ✅ Usando rewrites (proxy automático, mais eficiente)
  async getQuestions(): Promise<ApiResponse<Question[]>> {
    return this.request<Question[]>('/questions/');
  }

  async getQuestion(id: number): Promise<ApiResponse<Question>> {
    return this.request<Question>(`/questions/${id}`);
  }

  async createQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<ApiResponse<Question>> {
    return this.request<Question>('/questions/', {
      method: 'POST',
      body: JSON.stringify(question),
    });
  }

  // Answers endpoints - ✅ Usando rewrites (proxy automático)
  async getAnswers(questionId: number): Promise<ApiResponse<Answer[]>> {
    return this.request<Answer[]>(`/questions/${questionId}/answers`);
  }

  async createAnswer(questionId: number, answer: Omit<Answer, 'id' | 'question_id' | 'created_at'>): Promise<ApiResponse<Answer>> {
    // ✅ CORREÇÃO: Garantir que todos os campos obrigatórios estão presentes
    const answerData = {
      author_name: answer.author_name || '',
      content: answer.content || '',
      is_solution: answer.is_solution || false,
    };
    
    console.log('🔍 Enviando resposta:', answerData); // Debug
    
    return this.request<Answer>(`/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  }

  // Comments endpoints - ✅ Usando rewrites (proxy automático)
  async getComments(questionId: number): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/questions/${questionId}/comments`);
  }

  async createComment(questionId: number, comment: Omit<Comment, 'id' | 'question_id' | 'created_at'>): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/questions/${questionId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  // Feedback endpoints - ✅ Usando rewrites (proxy automático)
  async getFeedback(questionId: number): Promise<ApiResponse<Feedback[]>> {
    return this.request<Feedback[]>(`/questions/${questionId}/feedback`);
  }

  async createFeedback(questionId: number, feedback: Omit<Feedback, 'id' | 'question_id' | 'created_at'>): Promise<ApiResponse<Feedback>> {
    return this.request<Feedback>(`/questions/${questionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
