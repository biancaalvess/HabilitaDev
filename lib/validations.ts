import { z } from 'zod';

// Validações para autenticação
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  username: z.string()
    .min(2, 'Nome de usuário deve ter pelo menos 2 caracteres')
    .max(50, 'Nome de usuário deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nome de usuário deve conter apenas letras, números e underscore')
    .min(1, 'Nome de usuário é obrigatório'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
    .min(1, 'Senha é obrigatória'),
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// Validações para questões
export const questionSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .min(1, 'Título é obrigatório'),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .min(1, 'Descrição é obrigatória'),
  answer: z.string()
    .min(10, 'Resposta deve ter pelo menos 10 caracteres')
    .max(5000, 'Resposta deve ter no máximo 5000 caracteres')
    .min(1, 'Resposta é obrigatória'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'Dificuldade deve ser fácil, médio ou difícil' })
  }),
  category: z.enum(['algorithms', 'data_structures', 'system_design', 'databases', 'frontend', 'backend', 'devops'], {
    errorMap: () => ({ message: 'Categoria inválida' })
  }),
  company: z.string()
    .max(100, 'Nome da empresa deve ter no máximo 100 caracteres')
    .optional(),
  tags: z.array(z.string())
    .max(10, 'Máximo de 10 tags permitidas')
    .optional(),
});

// Validações para feedback
export const feedbackSchema = z.object({
  feedback_type: z.enum(['correction', 'suggestion', 'improvement'], {
    errorMap: () => ({ message: 'Tipo de feedback inválido' })
  }),
  content: z.string()
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
    .max(1000, 'Conteúdo deve ter no máximo 1000 caracteres')
    .min(1, 'Conteúdo é obrigatório'),
});

// Validações para respostas
export const answerSchema = z.object({
  author_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .min(1, 'Nome é obrigatório'),
  content: z.string()
    .min(10, 'Resposta deve ter pelo menos 10 caracteres')
    .max(5000, 'Resposta deve ter no máximo 5000 caracteres')
    .min(1, 'Resposta é obrigatória'),
  is_solution: z.boolean().optional().default(false),
});

// Validações para comentários
export const commentSchema = z.object({
  author_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .min(1, 'Nome é obrigatório'),
  comment_type: z.enum(['correction', 'suggestion'], {
    errorMap: () => ({ message: 'Tipo de comentário inválido' })
  }),
  content: z.string()
    .min(10, 'Comentário deve ter pelo menos 10 caracteres')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .min(1, 'Comentário é obrigatório'),
});

// Tipos derivados das validações
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
