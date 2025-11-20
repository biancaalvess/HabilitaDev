package models

import (
	"database/sql"
	"time"
)

// Correction representa uma correção de uma resposta
type Correction struct {
	ID              int64     `json:"id"`
	AnswerID        int64     `json:"answer_id"`
	IsCorrect       bool      `json:"is_correct"`
	Feedback        *string   `json:"feedback,omitempty"`
	Score           *float64  `json:"score,omitempty"`
	DetailedFeedback *string  `json:"detailed_feedback,omitempty"`
	Suggestions     *string   `json:"suggestions,omitempty"`
	Strengths       *string   `json:"strengths,omitempty"`
	Weaknesses      *string   `json:"weaknesses,omitempty"`
	Confidence      *float64  `json:"confidence,omitempty"`
	TimeTaken       *int      `json:"time_taken,omitempty"`
	CorrectedAt     time.Time `json:"corrected_at"`
}

// InsertCorrection insere uma nova correção
func InsertCorrection(db *sql.DB, correction *Correction) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO corrections (
			answer_id, is_correct, feedback, score, 
			detailed_feedback, suggestions, strengths, 
			weaknesses, confidence, time_taken
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		correction.AnswerID,
		correction.IsCorrect,
		correction.Feedback,
		correction.Score,
		correction.DetailedFeedback,
		correction.Suggestions,
		correction.Strengths,
		correction.Weaknesses,
		correction.Confidence,
		correction.TimeTaken,
	)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

// GetCorrection busca uma correção por ID
func GetCorrection(db *sql.DB, id int64) (*Correction, error) {
	row := db.QueryRow(`
		SELECT id, answer_id, is_correct, feedback, score,
		       detailed_feedback, suggestions, strengths,
		       weaknesses, confidence, time_taken, corrected_at
		FROM corrections 
		WHERE id = ?
	`, id)

	correction := Correction{}
	var feedback, detailedFeedback, suggestions, strengths, weaknesses sql.NullString
	var score, confidence sql.NullFloat64
	var timeTaken sql.NullInt64
	var correctedAt string

	err := row.Scan(
		&correction.ID,
		&correction.AnswerID,
		&correction.IsCorrect,
		&feedback,
		&score,
		&detailedFeedback,
		&suggestions,
		&strengths,
		&weaknesses,
		&confidence,
		&timeTaken,
		&correctedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if feedback.Valid {
		correction.Feedback = &feedback.String
	}
	if detailedFeedback.Valid {
		correction.DetailedFeedback = &detailedFeedback.String
	}
	if suggestions.Valid {
		correction.Suggestions = &suggestions.String
	}
	if strengths.Valid {
		correction.Strengths = &strengths.String
	}
	if weaknesses.Valid {
		correction.Weaknesses = &weaknesses.String
	}
	if score.Valid {
		correction.Score = &score.Float64
	}
	if confidence.Valid {
		correction.Confidence = &confidence.Float64
	}
	if timeTaken.Valid {
		t := int(timeTaken.Int64)
		correction.TimeTaken = &t
	}

	correction.CorrectedAt, err = time.Parse("2006-01-02 15:04:05", correctedAt)
	if err != nil {
		correction.CorrectedAt, err = time.Parse(time.RFC3339, correctedAt)
		if err != nil {
			return nil, err
		}
	}

	return &correction, nil
}

// GetCorrectionsByAnswerID busca todas as correções de uma resposta
func GetCorrectionsByAnswerID(db *sql.DB, answerID int64) ([]Correction, error) {
	rows, err := db.Query(`
		SELECT id, answer_id, is_correct, feedback, score,
		       detailed_feedback, suggestions, strengths,
		       weaknesses, confidence, time_taken, corrected_at
		FROM corrections 
		WHERE answer_id = ? 
		ORDER BY corrected_at DESC
	`, answerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var corrections []Correction
	for rows.Next() {
		var correction Correction
		var feedback, detailedFeedback, suggestions, strengths, weaknesses sql.NullString
		var score, confidence sql.NullFloat64
		var timeTaken sql.NullInt64
		var correctedAt string

		err := rows.Scan(
			&correction.ID,
			&correction.AnswerID,
			&correction.IsCorrect,
			&feedback,
			&score,
			&detailedFeedback,
			&suggestions,
			&strengths,
			&weaknesses,
			&confidence,
			&timeTaken,
			&correctedAt,
		)
		if err != nil {
			return nil, err
		}

		if feedback.Valid {
			correction.Feedback = &feedback.String
		}
		if detailedFeedback.Valid {
			correction.DetailedFeedback = &detailedFeedback.String
		}
		if suggestions.Valid {
			correction.Suggestions = &suggestions.String
		}
		if strengths.Valid {
			correction.Strengths = &strengths.String
		}
		if weaknesses.Valid {
			correction.Weaknesses = &weaknesses.String
		}
		if score.Valid {
			correction.Score = &score.Float64
		}
		if confidence.Valid {
			correction.Confidence = &confidence.Float64
		}
		if timeTaken.Valid {
			t := int(timeTaken.Int64)
			correction.TimeTaken = &t
		}

		correction.CorrectedAt, err = time.Parse("2006-01-02 15:04:05", correctedAt)
		if err != nil {
			correction.CorrectedAt, err = time.Parse(time.RFC3339, correctedAt)
			if err != nil {
				return nil, err
			}
		}

		corrections = append(corrections, correction)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return corrections, nil
}

// DeleteCorrection remove uma correção
func DeleteCorrection(db *sql.DB, id int64) error {
	stmt, err := db.Prepare("DELETE FROM corrections WHERE id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	return err
}

