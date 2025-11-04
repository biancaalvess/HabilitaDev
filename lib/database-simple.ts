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

  async getQuestions(): Promise<Question[]> {
    if (!this.db) return []; // Retorna array vazio se DB não disponível
    return this.db.all<Question[]>('SELECT * FROM questions');
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
}

export const databaseService = new DatabaseService();
