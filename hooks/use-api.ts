"use client";

import { useState, useEffect } from 'react';
import { apiService, type Question, type Answer, type Comment, type Feedback } from '@/lib/api';

// Hook para questões
export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getQuestions();
      
      // Garantir que response.data é um array
      const questionsData = Array.isArray(response.data) ? response.data : [];
      setQuestions(questionsData);
      setIsUsingMockData(false); // Sempre usando API real agora
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar questões');
      console.error('Error fetching questions:', err);
      // Em caso de erro, garantir que questions seja um array vazio
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return { questions, loading, error, isUsingMockData, refetch: fetchQuestions };
}

// Hook para uma questão específica
export function useQuestion(id: number) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getQuestion(id);
      setQuestion(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar questão');
      console.error('Error fetching question:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  return { question, loading, error, refetch: fetchQuestion };
}

// Hook para respostas
export function useAnswers(questionId: number) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAnswers(questionId);
      setAnswers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar respostas');
      console.error('Error fetching answers:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAnswer = async (answer: Omit<Answer, 'id' | 'question_id' | 'created_at'>) => {
    try {
      const response = await apiService.createAnswer(questionId, answer);
      setAnswers(prev => [response.data, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar resposta');
      console.error('Error adding answer:', err);
      return false;
    }
  };

  useEffect(() => {
    if (questionId) {
      fetchAnswers();
    }
  }, [questionId]);

  return { answers, loading, error, addAnswer, refetch: fetchAnswers };
}

// Hook para comentários
export function useComments(questionId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getComments(questionId);
      setComments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar comentários');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (comment: Omit<Comment, 'id' | 'question_id' | 'created_at'>) => {
    try {
      const response = await apiService.createComment(questionId, comment);
      setComments(prev => [response.data, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar comentário');
      console.error('Error adding comment:', err);
      return false;
    }
  };

  useEffect(() => {
    if (questionId) {
      fetchComments();
    }
  }, [questionId]);

  return { comments, loading, error, addComment, refetch: fetchComments };
}

// Hook para feedback
export function useFeedback(questionId: number) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getFeedback(questionId);
      setFeedback(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar feedback');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const addFeedback = async (feedbackData: Omit<Feedback, 'id' | 'question_id' | 'created_at'>) => {
    try {
      const response = await apiService.createFeedback(questionId, feedbackData);
      setFeedback(prev => [response.data, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar feedback');
      console.error('Error adding feedback:', err);
      return false;
    }
  };

  useEffect(() => {
    if (questionId) {
      fetchFeedback();
    }
  }, [questionId]);

  return { feedback, loading, error, addFeedback, refetch: fetchFeedback };
}

// Hook para health check
export function useHealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await apiService.healthCheck();
      setIsHealthy(response.success);
    } catch (err) {
      setIsHealthy(false);
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return { isHealthy, loading, checkHealth };
}
