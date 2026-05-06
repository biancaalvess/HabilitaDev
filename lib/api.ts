// Cliente HTTP: browser → /api/proxy → Spring /api/v1 (JSON snake_case). POST/PUT com application/json.
import { config, resolveJavaApiBaseUrl } from './config-simple';

const API_BASE_URL = config.api.baseUrl;

// No servidor, prefixa NEXT_PUBLIC_APP_URL para fetch absoluto ao BFF.
function resolveFetchBase(baseURL: string): string {
  if (typeof window !== 'undefined') {
    return baseURL;
  }
  const origin = (
    process.env.NEXT_PUBLIC_APP_URL ||
    config.development.appUrl ||
    ''
  ).replace(/\/+$/, '');
  if (!origin) return baseURL;
  return `${origin}${baseURL.startsWith('/') ? baseURL : `/${baseURL}`}`;
}

// Acrescenta texto ao content curto quando o backend exige tamanho mínimo (não usado com mcq_choice).
function normalizeAnswerContentForBackend(content: string): string {
  const c = String(content ?? "").trim();
  if (c.length >= 10) return c;
  if (c.length === 0) return c;
  const suffix = "\n(Seleção de múltipla escolha — HabilitaDev)";
  const out = `${c}${suffix}`;
  return out.length > 5000 ? out.slice(0, 5000) : out;
}

const isDevelopment = () => {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'development';
  }
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
  approved?: boolean;
  status?: string;
  author_name?: string;
  moderation_status?: 'approved' | 'rejected' | 'pending' | 'human_review' | string;
  moderation_motivo?: string | null;
  moderation_ajuste_sugerido?: string | null;
}

export interface Answer {
  id: number;
  question_id: number;
  author_name: string;
  content: string;
  created_at: string;
  is_solution: boolean;
}

export type AnswerCreatePayload = Omit<
  Answer,
  "id" | "question_id" | "created_at"
> & {
  mcq_choice?: string;
};

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

export interface CorrectionRequestBody {
  question_id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CorrectionRequestResponse {
  contact?: string;
  ai_prioridade?: string | null;
  ai_resumo?: string | null;
  ai_notas_para_equipa?: string | null;
  [key: string]: unknown;
}

export type ListQuestionsParams = {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
  search?: string;
  q?: string;
};

export function getServerJavaBackendOrigin(): string {
  return resolveJavaApiBaseUrl();
}

function assertServerOnly(fnName: string): void {
  if (typeof window !== 'undefined') {
    throw new Error(`${fnName} só pode ser usado no servidor (Server Component, Route Handler, etc.).`);
  }
}

export function buildListQuestionsQueryString(params: ListQuestionsParams = {}): string {
  const sp = new URLSearchParams();
  sp.set('page', String(params.page ?? 1));
  sp.set('limit', String(params.limit ?? 50));
  if (params.category) sp.set('category', params.category);
  if (params.difficulty) sp.set('difficulty', params.difficulty);
  if (params.search) sp.set('search', params.search);
  if (params.q) sp.set('q', params.q);
  return sp.toString();
}

function unwrapQuestionsListJson(data: unknown): Question[] {
  if (Array.isArray(data)) {
    return data as Question[];
  }
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) {
      return o.content as Question[];
    }
    if (Array.isArray(o.items)) {
      return o.items as Question[];
    }
    if (Array.isArray(o.data)) {
      return o.data as Question[];
    }
  }
  throw new Error('Formato de resposta inesperado ao listar questões.');
}

// GET /api/v1/questions no Spring (apenas servidor; exige URL do Java nas env).
export async function serverGetQuestions(
  params: ListQuestionsParams = {},
  init?: RequestInit
): Promise<Question[]> {
  assertServerOnly('serverGetQuestions');
  const origin = resolveJavaApiBaseUrl();
  if (!origin) {
    throw new Error(
      'URL do backend em falta. Defina BACKEND_URL (recomendado no servidor), NEXT_PUBLIC_BACKEND_URL ou NEXT_PUBLIC_API_URL (Java).'
    );
  }
  const qs = buildListQuestionsQueryString(params);
  const url = `${origin}/api/v1/questions?${qs}`;
  const res = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Erro ao buscar questões (${res.status})`);
  }
  const json: unknown = await res.json();
  return unwrapQuestionsListJson(json);
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
    const url = `${resolveFetchBase(this.baseURL)}${endpoint}`;
    
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
      if (isDevelopment()) {
        console.log('🔍 Fetching from:', url);
      }

      const isWriteOperation = options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH';
      const timeoutDuration = isWriteOperation ? config.api.timeout * 2 : config.api.timeout;

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
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('habilitadev_user_cache');
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
              window.location.href = '/?error=session_expired';
            }
          }
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (response.status === 403) {
          if (typeof window !== 'undefined') {
            import('@/hooks/use-toast').then(({ toast }) => {
              toast({
                title: 'Acesso Negado',
                description: 'Você não tem permissão para realizar esta ação.',
                variant: 'destructive',
              });
            }).catch(() => {
              console.warn('Permissão insuficiente para esta ação');
            });
          }
          throw new Error('Permissão insuficiente para realizar esta ação.');
        }
        
        if (response.status === 404) {
          const isQuestionById =
            /\/proxy\/questions\/\d+(\?|$)/.test(endpoint) &&
            !/\/answers|\/comments|\/feedback|\/validate-answer/.test(endpoint);
          const errorMessage = isQuestionById
            ? 'Questão não encontrada. Verifique o ID ou se a questão está aprovada na listagem pública.'
            : 'Recurso não encontrado (404). O backend pode não expor este endpoint ou o URL está incorreto.';
          if (isDevelopment()) {
            console.error('❌ 404:', endpoint, errorMessage);
          }
          throw new Error(errorMessage);
        }
        
        if (response.status === 503) {
          throw new Error(
            'Backend indisponível. Configure BACKEND_URL, NEXT_PUBLIC_BACKEND_URL ou NEXT_PUBLIC_API_URL (Java) e confirme que o Spring está a correr.'
          );
        }

        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails: any = null;
        let rawResponseText: string = '';
        
        try {
          const contentType = response.headers.get('content-type') || '';
          const isHTML = contentType.includes('text/html') || contentType.includes('application/xhtml');

          rawResponseText = await response.text();

          if (isHTML || rawResponseText.trim().startsWith('<!DOCTYPE') || rawResponseText.trim().startsWith('<html')) {
            console.error('❌ Backend retornou página HTML de erro em vez de JSON');
            if (response.status === 502) {
              errorMessage = 'O backend retornou uma página HTML de erro (502 Bad Gateway). O servidor pode estar offline ou com problemas. Se estiver usando Render, verifique os logs do serviço.';
            } else {
              errorMessage = `O backend retornou uma página HTML de erro (${response.status}). O servidor pode estar offline ou com problemas.`;
            }
            throw new Error(errorMessage);
          }

          if (response.status === 502) {
            try {
              const errorData = JSON.parse(rawResponseText);
              if (errorData.message) {
                errorMessage = errorData.message;
              }
              errorDetails = errorData.details;
            } catch {
              errorMessage = `O backend não está respondendo corretamente (502 Bad Gateway). Verifique se o servidor está rodando.`;
            }
            throw new Error(errorMessage);
          }
          
          if (rawResponseText) {
            try {
              const errorData = JSON.parse(rawResponseText);
              errorDetails = errorData;

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

              if (response.status === 400) {
                const validationErrors = errorData.details || errorData.errors || errorData.validation_errors;
                if (validationErrors) {
                  let detailsStr = '';
                  if (typeof validationErrors === 'string') {
                    detailsStr = validationErrors;
                  } else if (Array.isArray(validationErrors)) {
                    detailsStr = validationErrors.join(', ');
                  } else if (typeof validationErrors === 'object') {
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

                if (errorMessage === `HTTP error! status: ${response.status}` && rawResponseText) {
                  errorMessage = rawResponseText.length > 200 
                    ? rawResponseText.substring(0, 200) + '...' 
                    : rawResponseText;
                }
              }
            } catch (parseError) {
              errorMessage = rawResponseText || errorMessage;
            }
          }
        } catch (readError) {
          if (isDevelopment()) {
            console.error('❌ Failed to read error response:', readError);
          }
        }

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
      if (isDevelopment()) {
        console.log('✅ API Response:', data);
      }

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
      if (isDevelopment()) {
        if (!(error instanceof Error && error.message.includes('Service Unavailable'))) {
          console.error('❌ API request failed:', error);
        }
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
          const timeoutMsg = error.message.includes('segundos') 
            ? error.message 
            : 'A requisição demorou muito para responder. Verifique se o backend está rodando e tente novamente.';
          throw new Error(timeoutMsg);
        }

        if (error.message.includes('ERR_CONNECTION_REFUSED') || 
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('Connection refused')) {
          const backendUrl = config.api.backendUrl || 'o backend';
          throw new Error(`Não foi possível conectar ao backend em ${backendUrl}. Verifique se o servidor está rodando na porta 8080.`);
        }

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

  async listQuestions(
    params: ListQuestionsParams = {}
  ): Promise<ApiResponse<Question[]>> {
    const qs = buildListQuestionsQueryString(params);
    return this.request<Question[]>(`/proxy/questions?${qs}`);
  }

  async getQuestions(): Promise<ApiResponse<Question[]>> {
    return this.listQuestions({ page: 1, limit: 500 });
  }

  async getQuestion(id: number): Promise<ApiResponse<Question>> {
    return this.request<Question>(`/proxy/questions/${id}`);
  }

  async createQuestion(
    question: Omit<Question, 'id' | 'created_at'>
  ): Promise<ApiResponse<Question>> {
    const payload: Record<string, unknown> = {
      title: question.title,
      description: question.description,
      answer: question.answer,
      difficulty: question.difficulty,
      category: question.category,
    };
    if (question.company != null && String(question.company).trim() !== '') {
      payload.company = question.company;
    }
    if (question.tags?.length) {
      payload.tags = question.tags;
    }
    if (question.author_name?.trim()) {
      payload.author_name = question.author_name.trim();
    }
    return this.request<Question>('/proxy/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAnswers(questionId: number): Promise<ApiResponse<Answer[]>> {
    return this.request<Answer[]>(`/proxy/questions/${questionId}/answers`);
  }

  async createAnswer(
    questionId: number,
    answer: AnswerCreatePayload
  ): Promise<ApiResponse<Answer>> {
    const mcqChoice = String(answer.mcq_choice ?? "")
      .trim()
      .toUpperCase()
      .slice(0, 1);
    const rawContent = String(answer.content ?? "").trim();
    // Com mcq_choice o Spring valida a letra; não padronizar content.
    const content =
      mcqChoice.length > 0
        ? rawContent
        : normalizeAnswerContentForBackend(rawContent);

    const answerData: Record<string, unknown> = {
      author_name: String(answer.author_name ?? "").trim(),
      content,
      is_solution: Boolean(answer.is_solution),
    };
    if (mcqChoice.length > 0) {
      answerData.mcq_choice = mcqChoice;
    }

    if (isDevelopment()) {
      console.log("🔍 Enviando resposta:", answerData);
    }

    return this.request<Answer>(`/proxy/questions/${questionId}/answers`, {
      method: "POST",
      body: JSON.stringify(answerData),
    });
  }

  async getComments(questionId: number): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/proxy/questions/${questionId}/comments`);
  }

  async createComment(questionId: number, comment: Omit<Comment, 'id' | 'question_id' | 'created_at'>): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/proxy/questions/${questionId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  async getFeedback(questionId: number): Promise<ApiResponse<Feedback[]>> {
    return this.request<Feedback[]>(`/proxy/questions/${questionId}/feedback`);
  }

  async createFeedback(questionId: number, feedback: Omit<Feedback, 'id' | 'question_id' | 'created_at'>): Promise<ApiResponse<Feedback>> {
    return this.request<Feedback>(`/proxy/questions/${questionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async createCorrectionRequest(
    body: CorrectionRequestBody
  ): Promise<ApiResponse<CorrectionRequestResponse>> {
    return this.request<CorrectionRequestResponse>('/proxy/correction-requests', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async createContact(contact: Omit<Contact, 'id' | 'status' | 'created_at' | 'updated_at' | 'resolved_at' | 'admin_notes'>): Promise<ApiResponse<Contact>> {
    return this.request<Contact>('/proxy/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/proxy/health');
  }
}

export const apiService = new ApiService();
export default apiService;

// Lista questões via BFF (/api/proxy).
export async function getQuestions(params: ListQuestionsParams = {}): Promise<Question[]> {
  const { data } = await apiService.listQuestions(params);
  return data;
}

// Cria questão via BFF.
export async function createQuestion(
  question: Omit<Question, 'id' | 'created_at'>
): Promise<Question> {
  const { data } = await apiService.createQuestion(question);
  return data;
}
