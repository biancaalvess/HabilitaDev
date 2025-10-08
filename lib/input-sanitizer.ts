/**
 * Funções para sanitização e validação de entrada de usuários
 */

/**
 * Remove tags HTML e scripts maliciosos
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  // Remove tags HTML
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove scripts
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove event handlers (onclick, onerror, etc)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized.trim();
}

/**
 * Sanitiza HTML permitindo apenas tags seguras
 */
export function sanitizeHTML(html: string, allowedTags: string[] = []): string {
  if (!html) return '';

  const defaultAllowedTags = ['b', 'i', 'u', 'strong', 'em', 'code', 'pre'];
  const allowed = [...defaultAllowedTags, ...allowedTags];

  let sanitized = html;

  // Remove todas as tags exceto as permitidas
  sanitized = sanitized.replace(/<(\w+)[^>]*>/g, (match, tag) => {
    if (allowed.includes(tag.toLowerCase())) {
      return `<${tag}>`;
    }
    return '';
  });

  sanitized = sanitized.replace(/<\/(\w+)>/g, (match, tag) => {
    if (allowed.includes(tag.toLowerCase())) {
      return `</${tag}>`;
    }
    return '';
  });

  return sanitized;
}

/**
 * Valida comprimento de string
 */
export function validateLength(
  input: string,
  minLength: number,
  maxLength: number
): { valid: boolean; error?: string } {
  const length = input.trim().length;

  if (length < minLength) {
    return {
      valid: false,
      error: `O texto deve ter pelo menos ${minLength} caracteres`,
    };
  }

  if (length > maxLength) {
    return {
      valid: false,
      error: `O texto não pode ter mais de ${maxLength} caracteres`,
    };
  }

  return { valid: true };
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Remove caracteres especiais mantendo apenas alfanuméricos e alguns permitidos
 */
export function removeSpecialChars(
  input: string,
  allowedChars: string = '-_'
): string {
  const regex = new RegExp(`[^a-zA-Z0-9${allowedChars}]`, 'g');
  return input.replace(regex, '');
}

/**
 * Escape de caracteres especiais para SQL
 */
export function escapeSQLInput(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Valida se o input contém apenas caracteres seguros
 */
export function isSafeInput(input: string): boolean {
  // Verifica se contém scripts ou HTML malicioso
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitiza resposta de questão
 */
export function sanitizeAnswer(answer: string): {
  sanitized: string;
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Verifica se está vazio
  if (!answer || !answer.trim()) {
    errors.push('A resposta não pode estar vazia');
    return { sanitized: '', valid: false, errors };
  }

  // Sanitiza
  const sanitized = sanitizeInput(answer);

  // Valida comprimento
  const lengthValidation = validateLength(sanitized, 10, 5000);
  if (!lengthValidation.valid) {
    errors.push(lengthValidation.error!);
  }

  // Verifica segurança
  if (!isSafeInput(sanitized)) {
    errors.push('A resposta contém conteúdo não permitido');
  }

  return {
    sanitized,
    valid: errors.length === 0,
    errors,
  };
}

