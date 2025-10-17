import { Database } from 'sqlite3';
import { promisify } from 'util';
import { config } from './config';

// Interface para o usuário
export interface DatabaseUser {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

// Interface para questões
export interface DatabaseQuestion {
  id: number;
  title: string;
  description: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'algorithms' | 'data_structures' | 'system_design' | 'databases' | 'frontend' | 'backend' | 'devops';
  company?: string;
  tags?: string;
  created_at: string;
  approved: boolean;
}

class DatabaseService {
  private db: Database | null = null;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new Database(config.database.url, (err) => {
        if (err) {
          console.error('❌ Erro ao conectar com o banco:', err);
          reject(err);
        } else {
          console.log('✅ Conectado ao banco SQLite');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  private async initializeTables(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const run = promisify(this.db.run.bind(this.db));

    // Tabela de usuários
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de questões
    await run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        answer TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        category TEXT NOT NULL,
        company TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved BOOLEAN DEFAULT 0
      )
    `);

    // Tabela de respostas
    await run(`
      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        author_name TEXT NOT NULL,
        content TEXT NOT NULL,
        is_solution BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions (id)
      )
    `);

    // Tabela de comentários
    await run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        author_name TEXT NOT NULL,
        comment_type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions (id)
      )
    `);

    // Tabela de feedback
    await run(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        user_id INTEGER,
        feedback_type TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Inserir usuário admin padrão se não existir
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const get = promisify(this.db.get.bind(this.db));
    const run = promisify(this.db.run.bind(this.db));

    const existingAdmin = await get('SELECT id FROM users WHERE email = ?', ['admin@habilitadev.com']);
    
    if (!existingAdmin) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password', config.auth.bcryptRounds);
      
      await run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@habilitadev.com', hashedPassword, 'admin']
      );
      console.log('✅ Usuário admin padrão criado');
    }
  }

  // Métodos para usuários
  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    if (!this.db) throw new Error('Database not connected');
    const get = promisify(this.db.get.bind(this.db));
    return await get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async getUserById(id: number): Promise<DatabaseUser | null> {
    if (!this.db) throw new Error('Database not connected');
    const get = promisify(this.db.get.bind(this.db));
    return await get('SELECT * FROM users WHERE id = ?', [id]);
  }

  async createUser(user: Omit<DatabaseUser, 'id' | 'created_at'>): Promise<DatabaseUser> {
    if (!this.db) throw new Error('Database not connected');
    const run = promisify(this.db.run.bind(this.db));
    const get = promisify(this.db.get.bind(this.db));

    const result = await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [user.username, user.email, user.password, user.role]
    );

    const newUser = await get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    return newUser;
  }

  // Métodos para questões
  async getQuestions(): Promise<DatabaseQuestion[]> {
    if (!this.db) throw new Error('Database not connected');
    const all = promisify(this.db.all.bind(this.db));
    return await all('SELECT * FROM questions WHERE approved = 1 ORDER BY created_at DESC');
  }

  async getQuestionById(id: number): Promise<DatabaseQuestion | null> {
    if (!this.db) throw new Error('Database not connected');
    const get = promisify(this.db.get.bind(this.db));
    return await get('SELECT * FROM questions WHERE id = ?', [id]);
  }

  async createQuestion(question: Omit<DatabaseQuestion, 'id' | 'created_at'>): Promise<DatabaseQuestion> {
    if (!this.db) throw new Error('Database not connected');
    const run = promisify(this.db.run.bind(this.db));
    const get = promisify(this.db.get.bind(this.db));

    const result = await run(
      'INSERT INTO questions (title, description, answer, difficulty, category, company, tags, approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [question.title, question.description, question.answer, question.difficulty, question.category, question.company, question.tags, question.approved]
    );

    const newQuestion = await get('SELECT * FROM questions WHERE id = ?', [result.lastID]);
    return newQuestion;
  }

  async close(): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db!.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Conexão com banco fechada');
            resolve();
          }
        });
      });
    }
  }
}

export const databaseService = new DatabaseService();
