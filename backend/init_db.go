package main

import (
	"log"
	"habilitadev-backend/database"
)

func main() {
	log.Println("🔧 Inicializando banco de dados...")
	
	if err := database.InitDB(); err != nil {
		log.Fatalf("❌ Erro ao inicializar banco de dados: %v", err)
	}
	
	log.Println("✅ Banco de dados inicializado com sucesso!")
	log.Println("📁 Arquivo criado em: data/database.db")
}

