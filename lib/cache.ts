// Sistema de cache para dados offline
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Métodos específicos para questões
  setQuestions(questions: any[]): void {
    this.set('questions', questions, 10 * 60 * 1000); // 10 minutos
  }

  getQuestions(): any[] | null {
    return this.get('questions');
  }

  setQuestion(id: number, question: any): void {
    this.set(`question_${id}`, question, 10 * 60 * 1000);
  }

  getQuestion(id: number): any | null {
    return this.get(`question_${id}`);
  }
}

export const cacheService = new CacheService();
