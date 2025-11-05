import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcryptjs';
import { config } from './config-simple';

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface Question {
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

interface Comment {
  id: number;
  question_id: number;
  author_name: string;
  comment_type: 'correction' | 'suggestion';
  content: string;
  created_at: string;
}

interface Feedback {
  id: number;
  question_id: number;
  feedback_type: 'correction' | 'suggestion' | 'improvement';
  content: string;
  status: 'pending' | 'reviewed' | 'implemented';
  user_id?: number;
  created_at: string;
}

interface Answer {
  id: number;
  question_id: number;
  author_name: string;
  content: string;
  created_at: string;
  is_solution: boolean;
}

class DatabaseService {
  private db: Database | null = null;

  async connect() {
    if (this.db) {
      return;
    }

    try {
      // Em ambientes serverless (Vercel, etc), SQLite pode não funcionar
      // Verificar se estamos em ambiente que suporta SQLite
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        // Em produção, pode não ter acesso ao sistema de arquivos
        // SQLite será opcional e a aplicação usará fallbacks
        console.warn('⚠️ SQLite pode não estar disponível neste ambiente. Usando fallbacks.');
        return;
      }

      this.db = await open({
        filename: config.database.url.replace('file:', ''),
        driver: sqlite3.Database,
      });

      await this.createTables();
      await this.seedAdminUser();
      console.log('✅ SQLite database connected and initialized.');
    } catch (error) {
      // Falha graciosa: SQLite não disponível, mas aplicação continua funcionando
      console.warn('⚠️ SQLite não disponível. Aplicação usará fallbacks:', error instanceof Error ? error.message : 'Unknown error');
      this.db = null;
    }
  }

  async createTables() {
    if (!this.db) return; // Skip se DB não disponível

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        answer TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        category TEXT NOT NULL,
        company TEXT,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        approved BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        author_name TEXT NOT NULL,
        comment_type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        feedback_type TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        user_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        author_name TEXT NOT NULL,
        content TEXT NOT NULL,
        is_solution BOOLEAN DEFAULT FALSE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  async seedAdminUser() {
    if (!this.db) return; // Skip se DB não disponível

    const adminExists = await this.db.get('SELECT 1 FROM users WHERE email = ?', 'admin@habilitadev.com');
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('password', config.auth.bcryptRounds);
      await this.db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        'admin',
        'admin@habilitadev.com',
        hashedPassword,
        'admin'
      );
      console.log('Admin user seeded.');
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.db) return undefined; // Retorna undefined se DB não disponível
    return this.db.get<User>('SELECT * FROM users WHERE email = ?', email);
  }

  async getUserById(id: number): Promise<User | undefined> {
    if (!this.db) return undefined; // Retorna undefined se DB não disponível
    return this.db.get<User>('SELECT * FROM users WHERE id = ?', id);
  }

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    if (!this.db) throw new Error('Database not available in this environment');
    const result = await this.db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      userData.username,
      userData.email,
      userData.password,
      userData.role
    );
    const id = result.lastID;
    if (!id) throw new Error('Failed to create user');
    const newUser = await this.getUserById(id);
    if (!newUser) throw new Error('Failed to retrieve new user');
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    if (!this.db) throw new Error('Database not available in this environment');
    const updates: string[] = [];
    const values: any[] = [];
    
    if (userData.username) {
      updates.push('username = ?');
      values.push(userData.username);
    }
    if (userData.email) {
      updates.push('email = ?');
      values.push(userData.email);
    }
    if (userData.password) {
      updates.push('password = ?');
      values.push(userData.password);
    }
    if (userData.role) {
      updates.push('role = ?');
      values.push(userData.role);
    }
    
    if (updates.length === 0) {
      const user = await this.getUserById(id);
      if (!user) throw new Error('User not found');
      return user;
    }
    
    values.push(id);
    await this.db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );
    
    const updatedUser = await this.getUserById(id);
    if (!updatedUser) throw new Error('Failed to retrieve updated user');
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.db) return [];
    return this.db.all<User[]>('SELECT * FROM users ORDER BY created_at DESC');
  }

  async deleteUser(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not available in this environment');
    await this.db.run('DELETE FROM users WHERE id = ?', id);
  }

  // Email verification tokens
  async createEmailVerificationToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    if (!this.db) throw new Error('Database not available in this environment');
    // Invalidar tokens anteriores
    await this.db.run('UPDATE email_verification_tokens SET used = TRUE WHERE user_id = ?', userId);
    // Criar novo token
    await this.db.run(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      userId,
      token,
      expiresAt.toISOString()
    );
  }

  async getEmailVerificationToken(token: string): Promise<{ user_id: number; expires_at: string; used: boolean } | undefined> {
    if (!this.db) return undefined;
    return this.db.get('SELECT user_id, expires_at, used FROM email_verification_tokens WHERE token = ?', token);
  }

  async markEmailVerificationTokenAsUsed(token: string): Promise<void> {
    if (!this.db) throw new Error('Database not available in this environment');
    await this.db.run('UPDATE email_verification_tokens SET used = TRUE WHERE token = ?', token);
  }

  // Password reset tokens
  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    if (!this.db) throw new Error('Database not available in this environment');
    // Invalidar tokens anteriores
    await this.db.run('UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ?', userId);
    // Criar novo token
    await this.db.run(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      userId,
      token,
      expiresAt.toISOString()
    );
  }

  async getPasswordResetToken(token: string): Promise<{ user_id: number; expires_at: string; used: boolean } | undefined> {
    if (!this.db) return undefined;
    return this.db.get('SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?', token);
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    if (!this.db) throw new Error('Database not available in this environment');
    await this.db.run('UPDATE password_reset_tokens SET used = TRUE WHERE token = ?', token);
  }

  // Questions admin methods
  async updateQuestion(id: number, questionData: Partial<Question>): Promise<Question> {
    if (!this.db) throw new Error('Database not available in this environment');
    const updates: string[] = [];
    const values: any[] = [];
    
    if (questionData.title) {
      updates.push('title = ?');
      values.push(questionData.title);
    }
    if (questionData.description) {
      updates.push('description = ?');
      values.push(questionData.description);
    }
    if (questionData.answer) {
      updates.push('answer = ?');
      values.push(questionData.answer);
    }
    if (questionData.difficulty) {
      updates.push('difficulty = ?');
      values.push(questionData.difficulty);
    }
    if (questionData.category) {
      updates.push('category = ?');
      values.push(questionData.category);
    }
    if (questionData.company !== undefined) {
      updates.push('company = ?');
      values.push(questionData.company);
    }
    if (questionData.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(questionData.tags));
    }
    if (questionData.approved !== undefined) {
      updates.push('approved = ?');
      values.push(questionData.approved ? 1 : 0);
    }
    
    if (updates.length === 0) {
      const question = await this.getQuestionById(id);
      if (!question) throw new Error('Question not found');
      return question;
    }
    
    values.push(id);
    await this.db.run(
      `UPDATE questions SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );
    
    const updatedQuestion = await this.getQuestionById(id);
    if (!updatedQuestion) throw new Error('Failed to retrieve updated question');
    return {
      ...updatedQuestion,
      tags: updatedQuestion.tags ? (typeof updatedQuestion.tags === 'string' ? JSON.parse(updatedQuestion.tags) : updatedQuestion.tags) : [],
    };
  }

  async deleteQuestion(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not available in this environment');
    await this.db.run('DELETE FROM questions WHERE id = ?', id);
  }

  async getPendingQuestions(): Promise<Question[]> {
    if (!this.db) return [];
    const questions = await this.db.all<Question[]>('SELECT * FROM questions WHERE approved = FALSE ORDER BY created_at DESC');
    return questions.map(q => ({
      ...q,
      tags: q.tags ? (typeof q.tags === 'string' ? JSON.parse(q.tags) : q.tags) : [],
    }));
  }

  // Statistics
  async getStats(): Promise<{
    totalUsers: number;
    totalQuestions: number;
    pendingQuestions: number;
    approvedQuestions: number;
    totalFeedback: number;
    totalAnswers: number;
  }> {
    if (!this.db) {
      return {
        totalUsers: 0,
        totalQuestions: 0,
        pendingQuestions: 0,
        approvedQuestions: 0,
        totalFeedback: 0,
        totalAnswers: 0,
      };
    }
    
    const totalUsers = await this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
    const totalQuestions = await this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM questions');
    const pendingQuestions = await this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM questions WHERE approved = FALSE');
    const approvedQuestions = await this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM questions WHERE approved = TRUE');
    const totalFeedback = await this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM feedback');
    const totalAnswers = await this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM answers');
    
    return {
      totalUsers: totalUsers?.count || 0,
      totalQuestions: totalQuestions?.count || 0,
      pendingQuestions: pendingQuestions?.count || 0,
      approvedQuestions: approvedQuestions?.count || 0,
      totalFeedback: totalFeedback?.count || 0,
      totalAnswers: totalAnswers?.count || 0,
    };
  }

  async getQuestions(): Promise<Question[]> {
    if (!this.db) return []; // Retorna array vazio se DB não disponível
    const questions = await this.db.all<Question[]>('SELECT * FROM questions ORDER BY created_at DESC');
    return questions.map(q => ({
      ...q,
      tags: q.tags ? (typeof q.tags === 'string' ? JSON.parse(q.tags) : q.tags) : [],
    }));
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    if (!this.db) return undefined; // Retorna undefined se DB não disponível
    return this.db.get<Question>('SELECT * FROM questions WHERE id = ?', id);
  }

  async createQuestion(questionData: Omit<Question, 'id' | 'created_at' | 'approved'>): Promise<Question> {
    if (!this.db) throw new Error('Database not available in this environment');
    const result = await this.db.run(
      'INSERT INTO questions (title, description, answer, difficulty, category, company, tags, approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      questionData.title,
      questionData.description,
      questionData.answer,
      questionData.difficulty,
      questionData.category,
      questionData.company,
      questionData.tags ? JSON.stringify(questionData.tags) : null,
      false // Default to not approved
    );
    const id = result.lastID;
    if (!id) throw new Error('Failed to create question');
    const newQuestion = await this.getQuestionById(id);
    if (!newQuestion) throw new Error('Failed to retrieve new question');
    return newQuestion;
  }

  // Comments methods
  async getComments(questionId: number): Promise<Comment[]> {
    if (!this.db) return [];
    return this.db.all<Comment[]>('SELECT * FROM comments WHERE question_id = ? ORDER BY created_at DESC', questionId);
  }

  async createComment(commentData: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> {
    if (!this.db) throw new Error('Database not available in this environment');
    const result = await this.db.run(
      'INSERT INTO comments (question_id, author_name, comment_type, content) VALUES (?, ?, ?, ?)',
      commentData.question_id,
      commentData.author_name,
      commentData.comment_type,
      commentData.content
    );
    const id = result.lastID;
    if (!id) throw new Error('Failed to create comment');
    const newComment = await this.db.get<Comment>('SELECT * FROM comments WHERE id = ?', id);
    if (!newComment) throw new Error('Failed to retrieve new comment');
    return newComment;
  }

  // Feedback methods
  async getFeedback(questionId: number): Promise<Feedback[]> {
    if (!this.db) return [];
    return this.db.all<Feedback[]>('SELECT * FROM feedback WHERE question_id = ? ORDER BY created_at DESC', questionId);
  }

  async createFeedback(feedbackData: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback> {
    if (!this.db) throw new Error('Database not available in this environment');
    const result = await this.db.run(
      'INSERT INTO feedback (question_id, feedback_type, content, status, user_id) VALUES (?, ?, ?, ?, ?)',
      feedbackData.question_id,
      feedbackData.feedback_type,
      feedbackData.content,
      feedbackData.status || 'pending',
      feedbackData.user_id || null
    );
    const id = result.lastID;
    if (!id) throw new Error('Failed to create feedback');
    const newFeedback = await this.db.get<Feedback>('SELECT * FROM feedback WHERE id = ?', id);
    if (!newFeedback) throw new Error('Failed to retrieve new feedback');
    return newFeedback;
  }

  // Answers methods
  async getAnswers(questionId: number): Promise<Answer[]> {
    if (!this.db) return [];
    return this.db.all<Answer[]>('SELECT * FROM answers WHERE question_id = ? ORDER BY created_at DESC', questionId);
  }

  async createAnswer(answerData: Omit<Answer, 'id' | 'created_at'>): Promise<Answer> {
    if (!this.db) throw new Error('Database not available in this environment');
    const result = await this.db.run(
      'INSERT INTO answers (question_id, author_name, content, is_solution) VALUES (?, ?, ?, ?)',
      answerData.question_id,
      answerData.author_name,
      answerData.content,
      answerData.is_solution || false
    );
    const id = result.lastID;
    if (!id) throw new Error('Failed to create answer');
    const newAnswer = await this.db.get<Answer>('SELECT * FROM answers WHERE id = ?', id);
    if (!newAnswer) throw new Error('Failed to retrieve new answer');
    return newAnswer;
  }
}

export const databaseService = new DatabaseService();
