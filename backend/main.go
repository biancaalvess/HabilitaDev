package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"habilitadev-backend/database"
	"habilitadev-backend/models"
)

func main() {
	// Inicializar banco de dados
	if err := database.InitDB(); err != nil {
		log.Fatalf("Erro ao inicializar banco de dados: %v", err)
	}
	defer database.CloseDB()

	// Rotas
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/answers", answersHandler)
	http.HandleFunc("/api/answers/", answerByIDHandler)
	http.HandleFunc("/api/corrections", correctionsHandler)
	http.HandleFunc("/api/corrections/", correctionByIDHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Servidor iniciado na porta %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"database":  "connected",
	})
}

func answersHandler(w http.ResponseWriter, r *http.Request) {
	db, err := database.GetDB()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case "GET":
		questionID := r.URL.Query().Get("question_id")
		if questionID == "" {
			http.Error(w, "question_id é obrigatório", http.StatusBadRequest)
			return
		}

		answers, err := models.GetAnswersByQuestionID(db, questionID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    answers,
		})

	case "POST":
		var req struct {
			QuestionID string  `json:"question_id"`
			AnswerText string  `json:"answer_text"`
			UserID     *string `json:"user_id,omitempty"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Erro ao decodificar JSON", http.StatusBadRequest)
			return
		}

		if req.QuestionID == "" || req.AnswerText == "" {
			http.Error(w, "question_id e answer_text são obrigatórios", http.StatusBadRequest)
			return
		}

		id, err := models.InsertAnswer(db, req.QuestionID, req.AnswerText, req.UserID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		answer, err := models.GetAnswer(db, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    answer,
		})

	default:
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
	}
}

func answerByIDHandler(w http.ResponseWriter, r *http.Request) {
	db, err := database.GetDB()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	idStr := r.URL.Path[len("/api/answers/"):]
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case "GET":
		answer, err := models.GetAnswer(db, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if answer == nil {
			http.Error(w, "Resposta não encontrada", http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    answer,
		})

	case "DELETE":
		err := models.DeleteAnswer(db, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Resposta deletada com sucesso",
		})

	default:
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
	}
}

func correctionsHandler(w http.ResponseWriter, r *http.Request) {
	db, err := database.GetDB()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case "GET":
		answerIDStr := r.URL.Query().Get("answer_id")
		if answerIDStr == "" {
			http.Error(w, "answer_id é obrigatório", http.StatusBadRequest)
			return
		}

		answerID, err := strconv.ParseInt(answerIDStr, 10, 64)
		if err != nil {
			http.Error(w, "answer_id inválido", http.StatusBadRequest)
			return
		}

		corrections, err := models.GetCorrectionsByAnswerID(db, answerID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    corrections,
		})

	case "POST":
		var correction models.Correction
		if err := json.NewDecoder(r.Body).Decode(&correction); err != nil {
			http.Error(w, "Erro ao decodificar JSON", http.StatusBadRequest)
			return
		}

		if correction.AnswerID == 0 {
			http.Error(w, "answer_id é obrigatório", http.StatusBadRequest)
			return
		}

		id, err := models.InsertCorrection(db, &correction)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		correction.ID = id
		correction.CorrectedAt = time.Now()

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    correction,
		})

	default:
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
	}
}

func correctionByIDHandler(w http.ResponseWriter, r *http.Request) {
	db, err := database.GetDB()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Extrair ID do caminho
	path := r.URL.Path
	if !strings.HasPrefix(path, "/api/corrections/") {
		http.Error(w, "Caminho inválido", http.StatusBadRequest)
		return
	}

	idStr := path[len("/api/corrections/"):]
	if idStr == "" {
		// Se não há ID, redirecionar para handler genérico
		correctionsHandler(w, r)
		return
	}

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case "GET":
		correction, err := models.GetCorrection(db, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if correction == nil {
			http.Error(w, "Correção não encontrada", http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    correction,
		})

	case "DELETE":
		err := models.DeleteCorrection(db, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Correção deletada com sucesso",
		})

	default:
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
	}
}

