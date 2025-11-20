import { config } from './config-simple';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;
  private format: 'json' | 'pretty';

  constructor() {
    this.logLevel = config.log.level as LogLevel;
    this.format = config.log.format as 'json' | 'pretty';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    
    return levels[level] <= levels[this.logLevel];
  }

  private formatLog(entry: LogEntry): string {
    if (this.format === 'json') {
      return JSON.stringify(entry);
    }

    // Formato de texto legível
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase().padEnd(5);
    const context = entry.context ? `[${entry.context}]` : '';
    const message = entry.message;
    const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    const error = entry.error ? `\n${entry.error.stack}` : '';

    return `${timestamp} ${level} ${context} ${message}${data}${error}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error,
    };

    const formattedLog = this.formatLog(entry);

    // Usar console apropriado baseado no nível
    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'debug':
        console.debug(formattedLog);
        break;
    }

    // Em produção, enviar para serviço de monitoramento
    if (config.development.nodeEnv === 'production' && config.monitoring.enabled) {
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(entry: LogEntry) {
    // Integração com serviços de monitoramento em produção
    if (entry.level === 'error' && entry.error) {
      // Sentry (se configurado e instalado)
      if (config.monitoring.provider === 'sentry') {
        try {
          // Verificar se Sentry está disponível globalmente (configurado via sentry.client.config.ts)
          if (typeof window !== 'undefined') {
            // Client-side: verificar se Sentry está disponível no window
            const Sentry = (window as any).Sentry;
            if (Sentry && typeof Sentry.captureException === 'function') {
              Sentry.captureException(entry.error, {
                level: 'error',
                tags: {
                  context: entry.context,
                },
                extra: entry.data,
              });
            }
          } else {
            // Server-side: Sentry requer configuração via @sentry/nextjs
            // Para habilitar, instale @sentry/nextjs e configure sentry.server.config.ts
            // Por enquanto, apenas logamos no console (não há importação dinâmica)
            // Isso evita erros de build quando o Sentry não está instalado
          }
        } catch (error) {
          // Erro ao usar Sentry - silenciosamente ignorar
        }
      }
      
      // LogRocket (se configurado)
      if (config.monitoring.provider === 'logrocket' && typeof window !== 'undefined') {
        try {
          const LogRocket = (window as any).LogRocket;
          if (LogRocket && typeof LogRocket.captureException === 'function') {
            LogRocket.captureException(entry.error, {
              tags: {
                context: entry.context,
              },
              extra: entry.data,
            });
          }
        } catch (error) {
          console.error('Erro ao enviar para LogRocket:', error);
        }
      }
      
      // Fallback: log no console (útil para debugging em produção)
      console.error('Production error monitoring:', entry);
    }
  }

  error(message: string, context?: string, data?: any, error?: Error) {
    this.log('error', message, context, data, error);
  }

  warn(message: string, context?: string, data?: any) {
    this.log('warn', message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.log('info', message, context, data);
  }

  debug(message: string, context?: string, data?: any) {
    this.log('debug', message, context, data);
  }

  // Métodos específicos para diferentes contextos
  api(message: string, data?: any) {
    this.info(message, 'API', data);
  }

  auth(message: string, data?: any) {
    this.info(message, 'AUTH', data);
  }

  database(message: string, data?: any) {
    this.info(message, 'DATABASE', data);
  }

  cache(message: string, data?: any) {
    this.debug(message, 'CACHE', data);
  }

  security(message: string, data?: any) {
    this.warn(message, 'SECURITY', data);
  }

  performance(message: string, data?: any) {
    this.info(message, 'PERFORMANCE', data);
  }
}

export const logger = new Logger();

// Função para criar logger com contexto específico
export function createLogger(context: string) {
  return {
    error: (message: string, data?: any, error?: Error) => 
      logger.error(message, context, data, error),
    warn: (message: string, data?: any) => 
      logger.warn(message, context, data),
    info: (message: string, data?: any) => 
      logger.info(message, context, data),
    debug: (message: string, data?: any) => 
      logger.debug(message, context, data),
  };
}
