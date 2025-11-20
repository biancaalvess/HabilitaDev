package models

import (
	"database/sql"
	"time"
)

// Answer representa uma resposta do usuário
type Answer struct {
	ID         int64     `json:"id"`
	QuestionID string    `json:"question_id"`
	AnswerText string    `json:"answer_text"`
	UserID     *string   `json:"user_id,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

// InsertAnswer insere uma nova resposta no banco
func InsertAnswer(db *sql.DB, questionID, answerText string, userID *string) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO answers (question_id, answer_text, user_id) 
		VALUES (?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(questionID, answerText, userID)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

// GetAnswer busca uma resposta por ID
func GetAnswer(db *sql.DB, id int64) (*Answer, error) {
	row := db.QueryRow(`
		SELECT id, question_id, answer_text, user_id, created_at 
		FROM answers 
		WHERE id = ?
	`, id)

	answer := Answer{}
	var userID sql.NullString
	var createdAt string

	err := row.Scan(
		&answer.ID,
		&answer.QuestionID,
		&answer.AnswerText,
		&userID,
		&createdAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if userID.Valid {
		answer.UserID = &userID.String
	}

	answer.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
	if err != nil {
		// Tentar formato ISO
		answer.CreatedAt, err = time.Parse(time.RFC3339, createdAt)
		if err != nil {
			return nil, err
		}
	}

	return &answer, nil
}

// GetAnswersByQuestionID busca todas as respostas de uma questão
func GetAnswersByQuestionID(db *sql.DB, questionID string) ([]Answer, error) {
	rows, err := db.Query(`
		SELECT id, question_id, answer_text, user_id, created_at 
		FROM answers 
		WHERE question_id = ? 
		ORDER BY created_at DESC
	`, questionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var answers []Answer
	for rows.Next() {
		var answer Answer
		var userID sql.NullString
		var createdAt string

		err := rows.Scan(
			&answer.ID,
			&answer.QuestionID,
			&answer.AnswerText,
			&userID,
			&createdAt,
		)
		if err != nil {
			return nil, err
		}

		if userID.Valid {
			answer.UserID = &userID.String
		}

		answer.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if err != nil {
			answer.CreatedAt, err = time.Parse(time.RFC3339, createdAt)
			if err != nil {
				return nil, err
			}
		}

		answers = append(answers, answer)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return answers, nil
}

// DeleteAnswer remove uma resposta e suas correções
func DeleteAnswer(db *sql.DB, id int64) error {
	stmt, err := db.Prepare("DELETE FROM answers WHERE id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	return err
}

