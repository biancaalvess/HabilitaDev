/**
 * Rate Limiter para controlar frequência de requisições
 */
export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  /**
   * @param maxRequests - Número máximo de requisições permitidas
   * @param timeWindow - Janela de tempo em milissegundos
   */
  constructor(maxRequests: number, timeWindow: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  /**
   * Verifica se pode fazer uma nova requisição
   * @returns true se pode fazer a requisição, false caso contrário
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove requisições antigas fora da janela de tempo
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );

    // Verifica se atingiu o limite
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  /**
   * Retorna o tempo restante até poder fazer nova requisição (em ms)
   */
  getTimeUntilNextRequest(): number {
    if (this.requests.length < this.maxRequests) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    const now = Date.now();
    const timeElapsed = now - oldestRequest;
    const timeRemaining = this.timeWindow - timeElapsed;

    return Math.max(0, timeRemaining);
  }

  /**
   * Reseta o rate limiter
   */
  reset(): void {
    this.requests = [];
  }

  /**
   * Retorna quantas requisições ainda podem ser feitas
   */
  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

// Instâncias pré-configuradas para uso comum
export const answerSubmitLimiter = new RateLimiter(5, 60000); // 5 por minuto
export const validationLimiter = new RateLimiter(10, 60000); // 10 por minuto
export const feedbackLimiter = new RateLimiter(3, 60000); // 3 por minuto

