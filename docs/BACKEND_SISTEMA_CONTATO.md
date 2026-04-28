# Documentação: Sistema de Contato - Backend e Banco de Dados

## 📋 Visão Geral

Este documento descreve a implementação completa do sistema de contato no backend e banco de dados. O formulário permite que usuários enviem reclamações, sugestões, reportem bugs ou solicitem novas funcionalidades.

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `contacts`

```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('complaint', 'suggestion', 'bug', 'feature', 'other')),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'in_progress', 'resolved', 'archived')),
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Comentários para documentação
COMMENT ON TABLE contacts IS 'Tabela para armazenar contatos, reclamações e sugestões dos usuários';
COMMENT ON COLUMN contacts.contact_type IS 'Tipo de contato: complaint, suggestion, bug, feature, other';
COMMENT ON COLUMN contacts.status IS 'Status do contato: pending, read, in_progress, resolved, archived';
```

---

## 📦 Modelo de Dados (Go)

### Struct: `Contact`

```go
// internal/models/contact.go

package models

import (
    "time"
    "gorm.io/gorm"
)

type ContactType string

const (
    ContactTypeComplaint  ContactType = "complaint"
    ContactTypeSuggestion ContactType = "suggestion"
    ContactTypeBug        ContactType = "bug"
    ContactTypeFeature    ContactType = "feature"
    ContactTypeOther      ContactType = "other"
)

type ContactStatus string

const (
    ContactStatusPending    ContactStatus = "pending"
    ContactStatusRead       ContactStatus = "read"
    ContactStatusInProgress ContactStatus = "in_progress"
    ContactStatusResolved   ContactStatus = "resolved"
    ContactStatusArchived   ContactStatus = "archived"
)

type Contact struct {
    ID          uint          `json:"id" gorm:"primaryKey"`
    Name        string        `json:"name" gorm:"not null;size:255"`
    Email       string        `json:"email" gorm:"not null;size:255"`
    ContactType ContactType   `json:"contact_type" gorm:"not null;type:varchar(50)"`
    Subject     string        `json:"subject" gorm:"not null;size:500"`
    Message     string        `json:"message" gorm:"type:text;not null"`
    Status      ContactStatus `json:"status" gorm:"not null;default:'pending';type:varchar(20)"`
    AdminNotes  *string       `json:"admin_notes,omitempty" gorm:"type:text"`
    CreatedAt   time.Time     `json:"created_at"`
    UpdatedAt   time.Time     `json:"updated_at"`
    ResolvedAt  *time.Time    `json:"resolved_at,omitempty"`
}

// TableName especifica o nome da tabela
func (Contact) TableName() string {
    return "contacts"
}
```

---

## 🔌 Endpoints da API

### 1. Criar Contato (Público)

**POST** `/api/v1/contacts`

**Descrição:** Endpoint público para usuários enviarem contatos, reclamações ou sugestões.

**Request Body:**
```json
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "contact_type": "suggestion",
  "subject": "Sugestão de melhoria",
  "message": "Gostaria de sugerir a adição de mais questões sobre algoritmos..."
}
```

**Validações:**
- `name`: Obrigatório, mínimo 2 caracteres, máximo 255
- `email`: Obrigatório, formato de email válido
- `contact_type`: Obrigatório, deve ser um dos valores permitidos
- `subject`: Obrigatório, mínimo 5 caracteres, máximo 500
- `message`: Obrigatório, mínimo 20 caracteres, máximo 1000

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Maria Silva",
  "email": "maria@email.com",
  "contact_type": "suggestion",
  "subject": "Sugestão de melhoria",
  "message": "Gostaria de sugerir a adição de mais questões sobre algoritmos...",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Dados inválidos",
  "details": {
    "name": "Nome é obrigatório",
    "email": "Email inválido",
    "message": "Mensagem deve ter no mínimo 20 caracteres"
  }
}
```

---

### 2. Listar Contatos (Admin)

**GET** `/api/v1/admin/contacts`

**Descrição:** Endpoint administrativo para listar todos os contatos com filtros e paginação.

**Query Parameters:**
- `status`: Filtrar por status (pending, read, in_progress, resolved, archived)
- `type`: Filtrar por tipo (complaint, suggestion, bug, feature, other)
- `page`: Número da página (padrão: 1)
- `per_page`: Itens por página (padrão: 20, máximo: 100)
- `search`: Buscar por nome, email ou assunto

**Headers:**
- `Authorization: Bearer {token}` (requerido - apenas admins)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Maria Silva",
      "email": "maria@email.com",
      "contact_type": "suggestion",
      "subject": "Sugestão de melhoria",
      "message": "Gostaria de sugerir...",
      "status": "pending",
      "admin_notes": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "resolved_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### 3. Obter Contato por ID (Admin)

**GET** `/api/v1/admin/contacts/{id}`

**Descrição:** Obter detalhes de um contato específico.

**Headers:**
- `Authorization: Bearer {token}` (requerido - apenas admins)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Maria Silva",
  "email": "maria@email.com",
  "contact_type": "suggestion",
  "subject": "Sugestão de melhoria",
  "message": "Gostaria de sugerir a adição de mais questões sobre algoritmos...",
  "status": "pending",
  "admin_notes": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "resolved_at": null
}
```

---

### 4. Atualizar Status do Contato (Admin)

**PATCH** `/api/v1/admin/contacts/{id}`

**Descrição:** Atualizar status e adicionar notas administrativas.

**Headers:**
- `Authorization: Bearer {token}` (requerido - apenas admins)

**Request Body:**
```json
{
  "status": "in_progress",
  "admin_notes": "Em análise pela equipe de desenvolvimento"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Maria Silva",
  "email": "maria@email.com",
  "contact_type": "suggestion",
  "subject": "Sugestão de melhoria",
  "message": "Gostaria de sugerir...",
  "status": "in_progress",
  "admin_notes": "Em análise pela equipe de desenvolvimento",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z",
  "resolved_at": null
}
```

**Quando status for "resolved":**
- O campo `resolved_at` deve ser preenchido automaticamente com a data/hora atual

---

## 💻 Implementação no Backend

### 1. Handler: Criar Contato

**Arquivo:** `internal/handlers/contacts.go`

```go
package handlers

import (
    "net/http"
    "strconv"
    "time"
    
    "github.com/gin-gonic/gin"
    "your-project/internal/models"
    "your-project/internal/services"
)

type CreateContactRequest struct {
    Name        string `json:"name" binding:"required,min=2,max=255"`
    Email       string `json:"email" binding:"required,email"`
    ContactType string `json:"contact_type" binding:"required,oneof=complaint suggestion bug feature other"`
    Subject     string `json:"subject" binding:"required,min=5,max=500"`
    Message     string `json:"message" binding:"required,min=20,max=1000"`
}

func CreateContact(c *gin.Context) {
    var req CreateContactRequest
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Dados inválidos",
            "details": err.Error(),
        })
        return
    }

    // Criar contato
    contact := &models.Contact{
        Name:        req.Name,
        Email:       req.Email,
        ContactType: models.ContactType(req.ContactType),
        Subject:     req.Subject,
        Message:     req.Message,
        Status:      models.ContactStatusPending,
        CreatedAt:   time.Now(),
        UpdatedAt:   time.Now(),
    }

    // Salvar no banco
    if err := services.ContactService.Create(contact); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Erro ao criar contato",
        })
        return
    }

    c.JSON(http.StatusCreated, contact)
}
```

---

### 2. Handler: Listar Contatos (Admin)

```go
func GetContacts(c *gin.Context) {
    // Verificar se é admin (implementar middleware de autenticação)
    // if !isAdmin(c) {
    //     c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
    //     return
    // }

    // Obter parâmetros de query
    status := c.Query("status")
    contactType := c.Query("type")
    search := c.Query("search")
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

    // Limitar per_page máximo
    if perPage > 100 {
        perPage = 100
    }

    // Buscar contatos
    contacts, total, err := services.ContactService.GetAll(status, contactType, search, page, perPage)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Erro ao buscar contatos",
        })
        return
    }

    // Calcular total de páginas
    totalPages := (total + perPage - 1) / perPage

    c.JSON(http.StatusOK, gin.H{
        "data": contacts,
        "pagination": gin.H{
            "page":       page,
            "per_page":   perPage,
            "total":      total,
            "total_pages": totalPages,
        },
    })
}
```

---

### 3. Handler: Atualizar Status (Admin)

```go
type UpdateContactRequest struct {
    Status     *string `json:"status,omitempty" binding:"omitempty,oneof=pending read in_progress resolved archived"`
    AdminNotes *string `json:"admin_notes,omitempty" binding:"omitempty,max=2000"`
}

func UpdateContact(c *gin.Context) {
    // Verificar se é admin
    // if !isAdmin(c) {
    //     c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
    //     return
    // }

    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
        return
    }

    var req UpdateContactRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Dados inválidos",
            "details": err.Error(),
        })
        return
    }

    // Buscar contato
    contact, err := services.ContactService.GetByID(uint(id))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Contato não encontrado"})
        return
    }

    // Atualizar campos
    if req.Status != nil {
        contact.Status = models.ContactStatus(*req.Status)
        
        // Se status for "resolved", preencher resolved_at
        if *req.Status == "resolved" && contact.ResolvedAt == nil {
            now := time.Now()
            contact.ResolvedAt = &now
        }
    }
    
    if req.AdminNotes != nil {
        contact.AdminNotes = req.AdminNotes
    }

    contact.UpdatedAt = time.Now()

    // Salvar alterações
    if err := services.ContactService.Update(contact); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Erro ao atualizar contato",
        })
        return
    }

    c.JSON(http.StatusOK, contact)
}
```

---

### 4. Service: ContactService

**Arquivo:** `internal/services/contact_service.go`

```go
package services

import (
    "your-project/internal/models"
    "gorm.io/gorm"
)

type ContactService struct {
    db *gorm.DB
}

func NewContactService(db *gorm.DB) *ContactService {
    return &ContactService{db: db}
}

func (s *ContactService) Create(contact *models.Contact) error {
    return s.db.Create(contact).Error
}

func (s *ContactService) GetByID(id uint) (*models.Contact, error) {
    var contact models.Contact
    err := s.db.First(&contact, id).Error
    return &contact, err
}

func (s *ContactService) GetAll(status, contactType, search string, page, perPage int) ([]*models.Contact, int64, error) {
    var contacts []*models.Contact
    var total int64

    query := s.db.Model(&models.Contact{})

    // Aplicar filtros
    if status != "" {
        query = query.Where("status = ?", status)
    }
    if contactType != "" {
        query = query.Where("contact_type = ?", contactType)
    }
    if search != "" {
        query = query.Where("name ILIKE ? OR email ILIKE ? OR subject ILIKE ?", 
            "%"+search+"%", "%"+search+"%", "%"+search+"%")
    }

    // Contar total
    query.Count(&total)

    // Aplicar paginação
    offset := (page - 1) * perPage
    err := query.Order("created_at DESC").
        Limit(perPage).
        Offset(offset).
        Find(&contacts).Error

    return contacts, total, err
}

func (s *ContactService) Update(contact *models.Contact) error {
    return s.db.Save(contact).Error
}
```

---

### 5. Rotas

**Arquivo:** `internal/routes/routes.go` ou `internal/routes/contacts.go`

```go
package routes

import (
    "github.com/gin-gonic/gin"
    "your-project/internal/handlers"
)

func SetupContactRoutes(router *gin.RouterGroup) {
    // Rota pública
    router.POST("/contacts", handlers.CreateContact)

    // Rotas administrativas (requerem autenticação)
    admin := router.Group("/admin")
    admin.Use(authMiddleware()) // Implementar middleware de autenticação
    {
        admin.GET("/contacts", handlers.GetContacts)
        admin.GET("/contacts/:id", handlers.GetContactByID)
        admin.PATCH("/contacts/:id", handlers.UpdateContact)
    }
}
```

---

## ✅ Validações

### Frontend (já implementado)
- Nome: obrigatório, mínimo 2 caracteres
- Email: obrigatório, formato válido
- Tipo: obrigatório, seleção de opções
- Assunto: obrigatório, mínimo 5 caracteres
- Mensagem: obrigatório, mínimo 20 caracteres, máximo 1000

### Backend (a implementar)
```go
// Validações adicionais no backend
func ValidateContact(contact *models.Contact) error {
    // Validar email
    if !isValidEmail(contact.Email) {
        return errors.New("email inválido")
    }

    // Validar tipo
    validTypes := []string{"complaint", "suggestion", "bug", "feature", "other"}
    if !contains(validTypes, string(contact.ContactType)) {
        return errors.New("tipo de contato inválido")
    }

    // Validar tamanho da mensagem
    if len(contact.Message) < 20 || len(contact.Message) > 1000 {
        return errors.New("mensagem deve ter entre 20 e 1000 caracteres")
    }

    return nil
}
```

---

## 📧 Integração com Email (Opcional)

Para enviar notificações por email quando um novo contato for criado:

```go
func CreateContact(c *gin.Context) {
    // ... código de criação do contato ...

    // Enviar email de notificação (opcional)
    go func() {
        emailService.SendNotification(
            "admin@habilitadev.com",
            "Novo contato recebido",
            fmt.Sprintf("Novo contato de %s (%s): %s", contact.Name, contact.Email, contact.Subject),
        )
    }()

    c.JSON(http.StatusCreated, contact)
}
```

---

## 🧪 Testes Recomendados

### 1. Teste de Criação de Contato

```bash
curl -X POST http://localhost:8080/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@email.com",
    "contact_type": "suggestion",
    "subject": "Sugestão de melhoria",
    "message": "Gostaria de sugerir a adição de mais questões sobre algoritmos de ordenação."
  }'
```

### 2. Teste de Listagem (Admin)

```bash
curl -X GET "http://localhost:8080/api/v1/admin/contacts?status=pending&page=1&per_page=20" \
  -H "Authorization: Bearer {token}"
```

### 3. Teste de Atualização (Admin)

```bash
curl -X PATCH http://localhost:8080/api/v1/admin/contacts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "status": "in_progress",
    "admin_notes": "Em análise"
  }'
```

---

## 📊 Resumo

| Item | Descrição |
|------|-----------|
| **Tabela** | `contacts` |
| **Campos principais** | name, email, contact_type, subject, message, status |
| **Tipos de contato** | complaint, suggestion, bug, feature, other |
| **Status** | pending, read, in_progress, resolved, archived |
| **Endpoint público** | POST `/api/v1/contacts` |
| **Endpoints admin** | GET, PATCH `/api/v1/admin/contacts` |
| **Validações** | Nome (2-255), Email (válido), Assunto (5-500), Mensagem (20-1000) |

---

## 🔄 Próximos Passos

1. ✅ Criar tabela no banco de dados
2. ⚠️ Implementar modelo Contact
3. ⚠️ Implementar ContactService
4. ⚠️ Implementar handlers
5. ⚠️ Configurar rotas
6. ⚠️ Adicionar middleware de autenticação para rotas admin
7. ⚠️ Implementar validações
8. ⚠️ (Opcional) Integrar com serviço de email

---

**Última atualização:** 2024-01-15

