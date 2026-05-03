/**
 * Cliente HTTP → rotas Next (`/api/proxy/...`), que fazem proxy ao Spring Boot em `/api/v1/...`.
 * O backend serializa JSON em snake_case (Jackson); os tipos abaixo já usam created_at, author_name, etc.
 * Sem header Authorization nesta API. Content-Type: application/json em POST/PUT.
 */
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
  /** Presente nas respostas GET; no POST o backend pode ignorar e usar moderação (pendente → visível). */
  approved?: boolean;
  /** Ex.: pendente, visivel — quando o backend expuser o estado de moderação. */
  status?: string;
  author_name?: string;
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

export interface Contact {
  id: number;
  name: string;
  email: string;
  contact_type: 'complaint' | 'suggestion' | 'bug' | 'feature' | 'other';
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'in_progress' | 'resolved' | 'archived';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Feedback {
  id: number;
  question_id: number;
  user_id?: number;
  feedback_type: 'correction' | 'suggestion' | 'improvement' | 'deletion';
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
      // Timeout maior para operações de criação (POST/PUT)
      const isWriteOperation = options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH';
      const timeoutDuration = isWriteOperation ? config.api.timeout * 2 : config.api.timeout; // 60s para escrita, 30s para leitura
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        if (isDevelopment()) {
          console.warn(`⏱️ Timeout atingido após ${timeoutDuration}ms para ${options.method || 'GET'} ${url}`);
        }
        controller.abort();
      }, timeoutDuration);
      
      let response: Response;
      try {
        response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Melhor tratamento de erro de abort
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          const timeoutMessage = `A requisição demorou mais de ${timeoutDuration / 1000} segundos para responder.`;
          if (isDevelopment()) {
            console.error('❌ Request aborted:', {
              url,
              method: options.method || 'GET',
              timeout: timeoutDuration,
              error: fetchError.message
            });
          }
          throw new Error(timeoutMessage + ' Verifique se o backend está rodando e tente novamente.');
        }
        
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
          throw new Error('Backend indisponível. Verifique se o servidor está rodando e se NEXT_PUBLIC_API_URL (Java) ou NEXT_PUBLIC_BACKEND_URL está configurado.');
        }
        
        // Clonar response antes de ler para poder usar depois se necessário
        const responseClone = response.clone();
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails: any = null;
        let rawResponseText: string = '';
        
        try {
          // Verificar Content-Type antes de processar
          const contentType = response.headers.get('content-type') || '';
          const isHTML = contentType.includes('text/html') || contentType.includes('application/xhtml');
          
          // Ler o corpo da resposta como texto primeiro para poder fazer parse depois
          rawResponseText = await response.text();
          
          // Se a resposta for HTML (página de erro), tratar especialmente
          if (isHTML || rawResponseText.trim().startsWith('<!DOCTYPE') || rawResponseText.trim().startsWith('<html')) {
            console.error('❌ Backend retornou página HTML de erro em vez de JSON');
            if (response.status === 502) {
              errorMessage = 'O backend retornou uma página HTML de erro (502 Bad Gateway). O servidor pode estar offline ou com problemas. Se estiver usando Render, verifique os logs do serviço.';
            } else {
              errorMessage = `O backend retornou uma página HTML de erro (${response.status}). O servidor pode estar offline ou com problemas.`;
            }
            throw new Error(errorMessage);
          }
          
          // Tratamento especial para 502 Bad Gateway
          if (response.status === 502) {
            try {
              const errorData = JSON.parse(rawResponseText);
              if (errorData.message) {
                errorMessage = errorData.message;
              }
              errorDetails = errorData.details;
            } catch {
              // Se não for JSON, usar mensagem padrão
              errorMessage = `O backend não está respondendo corretamente (502 Bad Gateway). Verifique se o servidor está rodando.`;
            }
            throw new Error(errorMessage);
          }
          
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
      
      // Processar resposta (arrays diretos, envelope { success, data }, Spring Page { content }, etc.)
      let processedData: T;
      if (Array.isArray(data)) {
        processedData = data as T;
      } else if (data && typeof data === 'object' && 'success' in data && (data as any).success && (data as any).data !== undefined) {
        processedData = (data as any).data;
      } else if (data && typeof data === 'object' && Array.isArray((data as any).content)) {
        processedData = (data as any).content as T;
      } else if (data && typeof data === 'object' && Array.isArray((data as any).items)) {
        processedData = (data as any).items as T;
      } else if (data && typeof data === 'object' && (data as any).data !== undefined && !('success' in (data as any))) {
        processedData = (data as any).data;
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
      
      // Melhorar mensagens de erro para timeouts e conexão
      if (error instanceof Error) {
        // Erro de abort/timeout
        if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
          const timeoutMsg = error.message.includes('segundos') 
            ? error.message 
            : 'A requisição demorou muito para responder. Verifique se o backend está rodando e tente novamente.';
          throw new Error(timeoutMsg);
        }
        
        // Erro de conexão recusada (backend não está rodando)
        if (error.message.includes('ERR_CONNECTION_REFUSED') || 
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('Connection refused')) {
          const backendUrl = config.api.backendUrl || 'o backend';
          throw new Error(`Não foi possível conectar ao backend em ${backendUrl}. Verifique se o servidor está rodando na porta 8080.`);
        }
        
        // Erro de rede/conexão genérico
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') || 
            error.message.includes('ERR_') ||
            error.message.includes('Network request failed')) {
          const backendUrl = config.api.backendUrl || 'o servidor';
          throw new Error(`Não foi possível conectar ao servidor (${backendUrl}). Verifique se o backend está rodando e acessível.`);
        }
      }
      
      throw error;
    }
  }

  // Questions endpoints - ✅ Usando rewrites (proxy automático, mais eficiente)
  async getQuestions(): Promise<ApiResponse<Question[]>> {
    return this.request<Question[]>('/proxy/questions?limit=500&page=1');
  }

  async getQuestion(id: number): Promise<ApiResponse<Question>> {
    return this.request<Question>(`/proxy/questions/${id}`);
  }

  async createQuestion(
    question: Omit<Question, 'id' | 'created_at'>
  ): Promise<ApiResponse<Question>> {
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

  // Contact endpoints
  async createContact(contact: Omit<Contact, 'id' | 'status' | 'created_at' | 'updated_at' | 'resolved_at' | 'admin_notes'>): Promise<ApiResponse<Contact>> {
    return this.request<Contact>('/proxy/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/proxy/health');
  }
}

export const apiService = new ApiService();
export default apiService;
