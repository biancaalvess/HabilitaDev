package database

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

// GetDB retorna uma conexão com o banco de dados SQLite
func GetDB() (*sql.DB, error) {
	if DB != nil {
		return DB, nil
	}

	// Criar diretório se não existir
	dbDir := "data"
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, err
	}

	dbPath := filepath.Join(dbDir, "database.db")
	
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	// Configurações otimizadas para SQLite
	db.SetMaxOpenConns(1) // SQLite funciona melhor com uma conexão
	db.SetMaxIdleConns(1)

	// Habilitar foreign keys
	_, err = db.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		return nil, err
	}

	DB = db
	return DB, nil
}

// CreateTables cria todas as tabelas necessárias
func CreateTables(db *sql.DB) error {
	schema := `
	-- Tabela de respostas
	-- Armazena apenas as respostas dos usuários, não as questões
	CREATE TABLE IF NOT EXISTS answers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		question_id TEXT NOT NULL,
		answer_text TEXT NOT NULL,
		user_id TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	-- Tabela de correções
	-- Armazena as correções/sugestões das respostas
	CREATE TABLE IF NOT EXISTS corrections (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		answer_id INTEGER NOT NULL,
		is_correct BOOLEAN NOT NULL,
		feedback TEXT,
		score REAL,
		detailed_feedback TEXT,
		suggestions TEXT,
		strengths TEXT,
		weaknesses TEXT,
		confidence REAL,
		time_taken INTEGER,
		corrected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(answer_id) REFERENCES answers(id) ON DELETE CASCADE
	);

	-- Índices para melhor performance
	CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
	CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at);
	CREATE INDEX IF NOT EXISTS idx_corrections_answer_id ON corrections(answer_id);
	CREATE INDEX IF NOT EXISTS idx_corrections_corrected_at ON corrections(corrected_at);
	`

	_, err := db.Exec(schema)
	if err != nil {
		return err
	}

	log.Println("✅ Tabelas criadas com sucesso")
	return nil
}

// InitDB inicializa o banco de dados
func InitDB() error {
	db, err := GetDB()
	if err != nil {
		return err
	}

	return CreateTables(db)
}

// CloseDB fecha a conexão com o banco de dados
func CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

