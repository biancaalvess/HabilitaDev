// ✅ SOLUÇÃO: Usar proxy Next.js (resolve CORS e funciona sem backend local)
import { config } from './config-simple';

const API_BASE_URL = config.api.baseUrl;

// Helper para verificar se estamos em desenvolvimento
const isDevelopment = () => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NODE_ENV === 'development';
  }
  // Client-side - verificar se estamos em localhost
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

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

    const requestConfig: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      // Log apenas em desenvolvimento
      if (isDevelopment()) {
        console.log('🔍 Fetching from:', url);
      }
      
      // Usar AbortController para melhor controle do timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
      
      let response: Response;
      try {
        response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
      if (!response.ok) {
        // Tratamento especial para erros de autenticação/autorização
        if (response.status === 401) {
          // 401: Não Autorizado - Forçar logout
          if (typeof window !== 'undefined') {
            // Limpar cache local
            localStorage.removeItem('habilitadev_user_cache');
            // Redirecionar para login ou recarregar página
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
              window.location.href = '/?error=session_expired';
            }
          }
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        
        if (response.status === 403) {
          // 403: Proibido - Mostrar toast de permissão insuficiente
          if (typeof window !== 'undefined') {
            // Importar toast dinamicamente para evitar problemas de SSR
            import('@/hooks/use-toast').then(({ toast }) => {
              toast({
                title: 'Acesso Negado',
                description: 'Você não tem permissão para realizar esta ação.',
                variant: 'destructive',
              });
            }).catch(() => {
              // Fallback se toast não estiver disponível
              console.warn('Permissão insuficiente para esta ação');
            });
          }
          throw new Error('Permissão insuficiente para realizar esta ação.');
        }
        
        if (response.status === 404) {
          // 404: Endpoint não encontrado - pode ser backend offline ou endpoint não existe
          const errorMessage = 'Serviço temporariamente indisponível. O backend pode estar offline ou o endpoint não está disponível.';
          if (isDevelopment()) {
            console.error('❌ 404 - Endpoint não encontrado. Verifique se o backend está rodando e se o endpoint existe.');
          }
          throw new Error(errorMessage);
        }
        
        if (response.status === 503) {
          // 503: Service Unavailable - Backend não configurado ou offline
          throw new Error('Backend indisponível. Verifique se o servidor está rodando e se NEXT_PUBLIC_BACKEND_URL está configurado.');
        }
        
        // Clonar response antes de ler para poder usar depois se necessário
        const responseClone = response.clone();
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails: any = null;
        let rawResponseText: string = '';
        
        try {
          // Ler o corpo da resposta como texto primeiro para poder fazer parse depois
          rawResponseText = await response.text();
          
          if (rawResponseText) {
            try {
              const errorData = JSON.parse(rawResponseText);
              errorDetails = errorData;
              
              // Extrair mensagem de erro de diferentes formatos possíveis
              // Prioridade: message > error (string) > error (object) > msg > statusText
              if (errorData.message) {
                errorMessage = typeof errorData.message === 'string' ? errorData.message : errorMessage;
              } else if (errorData.error) {
                if (typeof errorData.error === 'string') {
                  errorMessage = errorData.error;
                } else if (typeof errorData.error === 'object') {
                  errorMessage = errorData.error.message || errorData.error.code || errorMessage;
                }
              } else if (errorData.msg) {
                errorMessage = typeof errorData.msg === 'string' ? errorData.msg : errorMessage;
              } else if (errorData.detail) {
                errorMessage = typeof errorData.detail === 'string' ? errorData.detail : errorMessage;
                }
              
              // Para erros 400, incluir detalhes de validação se disponíveis
              if (response.status === 400) {
                // Tentar extrair detalhes de validação de diferentes formatos
                const validationErrors = errorData.details || errorData.errors || errorData.validation_errors;
                if (validationErrors) {
                  let detailsStr = '';
                  if (typeof validationErrors === 'string') {
                    detailsStr = validationErrors;
                  } else if (Array.isArray(validationErrors)) {
                    detailsStr = validationErrors.join(', ');
                  } else if (typeof validationErrors === 'object') {
                    // Formato de objeto com campos e mensagens
                    const errorFields = Object.keys(validationErrors).map(key => {
                      const value = validationErrors[key];
                      return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
                    });
                    detailsStr = errorFields.join('; ');
                  }
                  
                  if (detailsStr) {
                    errorMessage += `\n\nDetalhes: ${detailsStr}`;
                  }
                }
                
                // Se ainda não temos uma mensagem específica, usar o texto completo
                if (errorMessage === `HTTP error! status: ${response.status}` && rawResponseText) {
                  errorMessage = rawResponseText.length > 200 
                    ? rawResponseText.substring(0, 200) + '...' 
                    : rawResponseText;
                }
              }
            } catch (parseError) {
              // Se não for JSON válido, usar o texto diretamente
              errorMessage = rawResponseText || errorMessage;
            }
          }
        } catch (readError) {
          // Se não conseguir ler o corpo, usar mensagem padrão
          // Apenas logar em desenvolvimento
          if (isDevelopment()) {
            console.error('❌ Failed to read error response:', readError);
          }
        }
        
        // Log apenas erros críticos ou em desenvolvimento
        // 503 (Service Unavailable) é esperado quando backend não está configurado
        if (response.status !== 503 && isDevelopment()) {
          console.error('❌ API Error:', response.status, errorMessage);
          if (errorDetails) {
            console.error('📋 Error details (parsed):', JSON.stringify(errorDetails, null, 2));
          }
          if (rawResponseText && !errorDetails) {
            console.error('📋 Error details (raw):', rawResponseText);
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // Log apenas em desenvolvimento
      if (isDevelopment()) {
        console.log('✅ API Response:', data);
      }
      
      // Processar resposta
      let processedData: T;
      if (Array.isArray(data)) {
        processedData = data as T;
      } else if (data.success && data.data) {
        processedData = data.data;
      } else {
        processedData = data;
      }
      
      return {
        success: true,
        data: processedData,
        message: 'Success'
      };
    } catch (error) {
      // Log apenas em desenvolvimento ou para erros não esperados
      if (isDevelopment()) {
        // Não logar erros 503 (Service Unavailable) - são esperados quando backend não está configurado
        if (!(error instanceof Error && error.message.includes('Service Unavailable'))) {
          console.error('❌ API request failed:', error);
        }
      }
      
      // Melhorar mensagens de erro para timeouts
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
          throw new Error('A requisição demorou muito para responder. Verifique sua conexão e tente novamente.');
        }
      }
      
      throw error;
    }
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
    
    // Log apenas em desenvolvimento
    if (isDevelopment()) {
      console.log('🔍 Enviando resposta:', answerData);
    }
    
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
