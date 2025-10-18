"use client";

import { memo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';

interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

const ErrorDisplay = memo(function ErrorDisplay({
  error,
  title = 'Algo deu errado',
  description = 'Ocorreu um erro inesperado. Tente novamente ou entre em contato conosco se o problema persistir.',
  onRetry,
  onGoHome,
  showDetails = false,
  variant = 'default',
  className = '',
}: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && error.stack ? error.stack : null;

  if (variant === 'inline') {
    return (
      <div className={`text-destructive text-sm ${className}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {title}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {description}
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground font-mono">
              {errorMessage}
            </p>
          </div>
          
          {showDetails && errorStack && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                <Bug className="inline w-4 h-4 mr-1" />
                Detalhes técnicos
              </summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                {errorStack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            )}
            
            {onGoHome && (
              <Button onClick={onGoHome} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';

// Componente para erros de rede
export const NetworkErrorDisplay = memo(function NetworkErrorDisplay({
  onRetry,
  className = '',
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ErrorDisplay
      error="Erro de conexão"
      title="Sem conexão"
      description="Verifique sua conexão com a internet e tente novamente."
      onRetry={onRetry}
      variant="default"
      className={className}
    />
  );
});

NetworkErrorDisplay.displayName = 'NetworkErrorDisplay';

// Componente para erros de autenticação
export const AuthErrorDisplay = memo(function AuthErrorDisplay({
  onRetry,
  onGoHome,
  className = '',
}: {
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}) {
  return (
    <ErrorDisplay
      error="Erro de autenticação"
      title="Acesso negado"
      description="Sua sessão expirou ou você não tem permissão para acessar este recurso."
      onRetry={onRetry}
      onGoHome={onGoHome}
      variant="default"
      className={className}
    />
  );
});

AuthErrorDisplay.displayName = 'AuthErrorDisplay';

// Componente para erros de validação
export const ValidationErrorDisplay = memo(function ValidationErrorDisplay({
  errors,
  className = '',
}: {
  errors: string[];
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error, index) => (
        <ErrorDisplay
          key={index}
          error={error}
          variant="inline"
        />
      ))}
    </div>
  );
});

ValidationErrorDisplay.displayName = 'ValidationErrorDisplay';

export { ErrorDisplay };
