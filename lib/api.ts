// ✅ SOLUÇÃO: Usar proxy Next.js (resolve CORS e funciona sem backend local)
import { cacheService } from './cache';
import { mockQuestions, mockAnswers, mockComments, mockFeedback, simulateNetworkDelay } from './mock-data';
import { config } from './config-simple';

const API_BASE_URL = config.api.baseUrl;

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
    const cacheKey = `api_${endpoint}_${JSON.stringify(options)}`;
    
    // Verificar cache primeiro
    const cachedData = cacheService.get<T>(cacheKey);
    if (cachedData) {
      console.log('📦 Cache hit for:', endpoint);
      return {
        success: true,
        data: cachedData,
        message: 'Success (cached)'
      };
    }
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const requestConfig: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log('🔍 Fetching from:', url);
      const response = await fetch(url, {
        ...requestConfig,
        signal: AbortSignal.timeout(config.api.timeout),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      
      // Processar resposta
      let processedData: T;
      if (Array.isArray(data)) {
        processedData = data as T;
      } else if (data.success && data.data) {
        processedData = data.data;
      } else {
        processedData = data;
      }
      
      // Armazenar no cache
      cacheService.set(cacheKey, processedData, 5 * 60 * 1000); // 5 minutos
      
      return {
        success: true,
        data: processedData,
        message: 'Success'
      };
    } catch (error) {
      console.error('❌ API request failed:', error);
      
      // Tentar usar dados mock como fallback
      const fallbackData = this.getFallbackData<T>(endpoint);
      if (fallbackData) {
        console.log('🔄 Using fallback data for:', endpoint);
        return {
          success: true,
          data: fallbackData,
          message: 'Success (offline mode)'
        };
      }
      
      throw error;
    }
  }

  private getFallbackData<T>(endpoint: string): T | null {
    // Mapear endpoints para dados mock
    if (endpoint === '/questions/') {
      return mockQuestions as T;
    }
    
    // Para outras rotas, retornar null (sem fallback)
    return null;
  }

  // Questions endpoints - ✅ Usando rewrites (proxy automático, mais eficiente)
  async getQuestions(): Promise<ApiResponse<Question[]>> {
    return this.request<Question[]>('/proxy/questions');
  }

  async getQuestion(id: number): Promise<ApiResponse<Question>> {
    return this.request<Question>(`/proxy/questions/${id}`);
  }

  async createQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<ApiResponse<Question>> {
    return this.request<Question>('/proxy/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    });
  }

  // Answers endpoints - ✅ Usando rewrites (proxy automático)
  async getAnswers(questionId: number): Promise<ApiResponse<Answer[]>> {
    return this.request<Answer[]>(`/proxy/questions/${questionId}/answers`);
  }

  async createAnswer(questionId: number, answer: Omit<Answer, 'id' | 'question_id' | 'created_at'>): Promise<ApiResponse<Answer>> {
    // ✅ CORREÇÃO: Garantir que todos os campos obrigatórios estão presentes
    const answerData = {
      author_name: answer.author_name || '',
      content: answer.content || '',
      is_solution: answer.is_solution || false,
    };
    
    console.log('🔍 Enviando resposta:', answerData); // Debug
    
    return this.request<Answer>(`/proxy/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  }

  // Comments endpoints - ✅ Usando rewrites (proxy automático)
  async getComments(questionId: number): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/proxy/questions/${questionId}/comments`);
  }

  async createComment(questionId: number, comment: Omit<Comment, 'id' | 'question_id' | 'created_at'>): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/proxy/questions/${questionId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  // Feedback endpoints - ✅ Usando rewrites (proxy automático)
  async getFeedback(questionId: number): Promise<ApiResponse<Feedback[]>> {
    return this.request<Feedback[]>(`/proxy/questions/${questionId}/feedback`);
  }

  async createFeedback(questionId: number, feedback: Omit<Feedback, 'id' | 'question_id' | 'created_at'>): Promise<ApiResponse<Feedback>> {
    return this.request<Feedback>(`/proxy/questions/${questionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/proxy/health');
  }
}

export const apiService = new ApiService();
export default apiService;
