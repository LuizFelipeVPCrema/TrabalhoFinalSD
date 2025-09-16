package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Materia struct {
	ID        int       `json:"id"`
	Nome      string    `json:"nome"`
	Descricao string    `json:"descricao"`
	UserID    int       `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ProvaTrabalho struct {
	ID              int        `json:"id"`
	Titulo          string     `json:"titulo"`
	ConteudosEstudo string     `json:"conteudos_estudo"`
	Anexos          []string   `json:"anexos"`
	Referencias     []string   `json:"referencias"`
	DataEntrega     *time.Time `json:"data_entrega,omitempty"`
	MateriaID       int        `json:"materia_id"`
	UserID          int        `json:"user_id"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type CreateMateriaRequest struct {
	Nome      string `json:"nome"`
	Descricao string `json:"descricao"`
}

type CreateProvaTrabalhoRequest struct {
	Titulo          string     `json:"titulo"`
	ConteudosEstudo string     `json:"conteudos_estudo"`
	Anexos          []string   `json:"anexos"`
	Referencias     []string   `json:"referencias"`
	DataEntrega     *time.Time `json:"data_entrega,omitempty"`
	MateriaID       int        `json:"materia_id"`
}

type AuthResponse struct {
	Valid  bool   `json:"valid"`
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
	Code    int    `json:"code"`
}

type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

var (
	materias        []Materia
	provasTrabalhos []ProvaTrabalho
	nextMateriaID   = 1
	nextProvaID     = 1
	authServiceURL  = "http://auth-service:8080"
)

// Funções auxiliares para validação e resposta
func writeErrorResponse(w http.ResponseWriter, statusCode int, errorMsg, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{
		Error:   errorMsg,
		Message: message,
		Code:    statusCode,
	})
}

func writeSuccessResponse(w http.ResponseWriter, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(SuccessResponse{
		Message: message,
		Data:    data,
	})
}

func validateStringField(field, fieldName string, minLength int) error {
	if strings.TrimSpace(field) == "" {
		return fmt.Errorf("%s é obrigatório", fieldName)
	}
	if len(strings.TrimSpace(field)) < minLength {
		return fmt.Errorf("%s deve ter pelo menos %d caracteres", fieldName, minLength)
	}
	return nil
}

func logUserAction(userID int, action, resource string) {
	log.Printf("User %d: %s %s at %s", userID, action, resource, time.Now().Format(time.RFC3339))
}

func validateToken(token string) (*AuthResponse, error) {
	req, err := http.NewRequest("GET", authServiceURL+"/validate", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token inválido")
	}

	var authResp AuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return nil, err
	}

	return &authResp, nil
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			log.Printf("Acesso negado: Token não fornecido - IP: %s", r.RemoteAddr)
			writeErrorResponse(w, http.StatusUnauthorized, "UNAUTHORIZED", "Token de autenticação não fornecido")
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			log.Printf("Acesso negado: Formato de token inválido - IP: %s", r.RemoteAddr)
			writeErrorResponse(w, http.StatusUnauthorized, "UNAUTHORIZED", "Formato de token inválido")
			return
		}

		token := authHeader[7:] // Remove "Bearer "
		authResp, err := validateToken(token)
		if err != nil {
			log.Printf("Acesso negado: Token inválido - IP: %s, Erro: %v", r.RemoteAddr, err)
			writeErrorResponse(w, http.StatusUnauthorized, "UNAUTHORIZED", "Token de autenticação inválido ou expirado")
			return
		}

		// Adicionar user_id ao contexto da requisição
		r.Header.Set("X-User-ID", strconv.Itoa(authResp.UserID))
		log.Printf("Acesso autorizado: User %d - %s %s", authResp.UserID, r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	}
}

func getMateriasHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))

	var userMaterias []Materia
	for _, materia := range materias {
		if materia.UserID == userID {
			userMaterias = append(userMaterias, materia)
		}
	}

	logUserAction(userID, "GET", "materias")
	writeSuccessResponse(w, "Matérias carregadas com sucesso", userMaterias)
}

func createMateriaHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))

	var req CreateMateriaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Erro ao decodificar dados da matéria para user %d: %v", userID, err)
		writeErrorResponse(w, http.StatusBadRequest, "BAD_REQUEST", "Dados inválidos fornecidos")
		return
	}

	// Validações
	if err := validateStringField(req.Nome, "Nome", 2); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := validateStringField(req.Descricao, "Descrição", 5); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Verificar se já existe uma matéria com o mesmo nome para este usuário
	for _, materia := range materias {
		if materia.UserID == userID && strings.EqualFold(strings.TrimSpace(materia.Nome), strings.TrimSpace(req.Nome)) {
			writeErrorResponse(w, http.StatusConflict, "CONFLICT", "Já existe uma matéria com este nome")
			return
		}
	}

	materia := Materia{
		ID:        nextMateriaID,
		Nome:      strings.TrimSpace(req.Nome),
		Descricao: strings.TrimSpace(req.Descricao),
		UserID:    userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	materias = append(materias, materia)
	nextMateriaID++

	logUserAction(userID, "CREATE", fmt.Sprintf("materia %d", materia.ID))
	writeSuccessResponse(w, "Matéria criada com sucesso", materia)
}

func updateMateriaHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var req CreateMateriaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Erro ao decodificar dados da atualização da matéria %d para user %d: %v", id, userID, err)
		writeErrorResponse(w, http.StatusBadRequest, "BAD_REQUEST", "Dados inválidos fornecidos")
		return
	}

	// Validações
	if err := validateStringField(req.Nome, "Nome", 2); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := validateStringField(req.Descricao, "Descrição", 5); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Verificar se já existe uma matéria com o mesmo nome para este usuário (excluindo a atual)
	for _, materia := range materias {
		if materia.UserID == userID && materia.ID != id && strings.EqualFold(strings.TrimSpace(materia.Nome), strings.TrimSpace(req.Nome)) {
			writeErrorResponse(w, http.StatusConflict, "CONFLICT", "Já existe uma matéria com este nome")
			return
		}
	}

	for i, materia := range materias {
		if materia.ID == id && materia.UserID == userID {
			materias[i].Nome = strings.TrimSpace(req.Nome)
			materias[i].Descricao = strings.TrimSpace(req.Descricao)
			materias[i].UpdatedAt = time.Now()

			logUserAction(userID, "UPDATE", fmt.Sprintf("materia %d", id))
			writeSuccessResponse(w, "Matéria atualizada com sucesso", materias[i])
			return
		}
	}

	log.Printf("Tentativa de atualizar matéria inexistente: ID %d, User %d", id, userID)
	writeErrorResponse(w, http.StatusNotFound, "NOT_FOUND", "Matéria não encontrada ou não pertence ao usuário")
}

func deleteMateriaHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	// Verificar se existem provas/trabalhos associados a esta matéria
	for _, prova := range provasTrabalhos {
		if prova.MateriaID == id && prova.UserID == userID {
			writeErrorResponse(w, http.StatusConflict, "CONFLICT", "Não é possível excluir a matéria pois existem provas/trabalhos associados a ela")
			return
		}
	}

	for i, materia := range materias {
		if materia.ID == id && materia.UserID == userID {
			materias = append(materias[:i], materias[i+1:]...)
			logUserAction(userID, "DELETE", fmt.Sprintf("materia %d", id))
			writeSuccessResponse(w, "Matéria excluída com sucesso", nil)
			return
		}
	}

	log.Printf("Tentativa de excluir matéria inexistente: ID %d, User %d", id, userID)
	writeErrorResponse(w, http.StatusNotFound, "NOT_FOUND", "Matéria não encontrada ou não pertence ao usuário")
}

func getProvasTrabalhosHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))

	var userProvas []ProvaTrabalho
	for _, prova := range provasTrabalhos {
		if prova.UserID == userID {
			userProvas = append(userProvas, prova)
		}
	}

	logUserAction(userID, "GET", "provas-trabalhos")
	writeSuccessResponse(w, "Provas/Trabalhos carregados com sucesso", userProvas)
}

func createProvaTrabalhoHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))

	var req CreateProvaTrabalhoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Erro ao decodificar dados da prova/trabalho para user %d: %v", userID, err)
		writeErrorResponse(w, http.StatusBadRequest, "BAD_REQUEST", "Dados inválidos fornecidos")
		return
	}

	// Validações
	if err := validateStringField(req.Titulo, "Título", 3); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := validateStringField(req.ConteudosEstudo, "Conteúdos de Estudo", 5); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if req.MateriaID <= 0 {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", "ID da matéria é obrigatório")
		return
	}

	// Verificar se a matéria pertence ao usuário
	materiaExists := false
	var materiaNome string
	for _, materia := range materias {
		if materia.ID == req.MateriaID && materia.UserID == userID {
			materiaExists = true
			materiaNome = materia.Nome
			break
		}
	}

	if !materiaExists {
		log.Printf("Tentativa de criar prova/trabalho para matéria inexistente: MateriaID %d, User %d", req.MateriaID, userID)
		writeErrorResponse(w, http.StatusNotFound, "NOT_FOUND", "Matéria não encontrada ou não pertence ao usuário")
		return
	}

	// Validar data de entrega se fornecida
	if req.DataEntrega != nil && req.DataEntrega.Before(time.Now()) {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", "Data de entrega não pode ser no passado")
		return
	}

	prova := ProvaTrabalho{
		ID:              nextProvaID,
		Titulo:          strings.TrimSpace(req.Titulo),
		ConteudosEstudo: strings.TrimSpace(req.ConteudosEstudo),
		Anexos:          req.Anexos,
		Referencias:     req.Referencias,
		DataEntrega:     req.DataEntrega,
		MateriaID:       req.MateriaID,
		UserID:          userID,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	provasTrabalhos = append(provasTrabalhos, prova)
	nextProvaID++

	logUserAction(userID, "CREATE", fmt.Sprintf("prova-trabalho %d para matéria %s", prova.ID, materiaNome))
	writeSuccessResponse(w, "Prova/Trabalho criado com sucesso", prova)
}

func updateProvaTrabalhoHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var req CreateProvaTrabalhoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Erro ao decodificar dados da atualização da prova/trabalho %d para user %d: %v", id, userID, err)
		writeErrorResponse(w, http.StatusBadRequest, "BAD_REQUEST", "Dados inválidos fornecidos")
		return
	}

	// Validações
	if err := validateStringField(req.Titulo, "Título", 3); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := validateStringField(req.ConteudosEstudo, "Conteúdos de Estudo", 5); err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if req.MateriaID <= 0 {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", "ID da matéria é obrigatório")
		return
	}

	// Verificar se a matéria pertence ao usuário
	materiaExists := false
	var materiaNome string
	for _, materia := range materias {
		if materia.ID == req.MateriaID && materia.UserID == userID {
			materiaExists = true
			materiaNome = materia.Nome
			break
		}
	}

	if !materiaExists {
		log.Printf("Tentativa de atualizar prova/trabalho para matéria inexistente: MateriaID %d, User %d", req.MateriaID, userID)
		writeErrorResponse(w, http.StatusNotFound, "NOT_FOUND", "Matéria não encontrada ou não pertence ao usuário")
		return
	}

	// Validar data de entrega se fornecida
	if req.DataEntrega != nil && req.DataEntrega.Before(time.Now()) {
		writeErrorResponse(w, http.StatusBadRequest, "VALIDATION_ERROR", "Data de entrega não pode ser no passado")
		return
	}

	for i, prova := range provasTrabalhos {
		if prova.ID == id && prova.UserID == userID {
			provasTrabalhos[i].Titulo = strings.TrimSpace(req.Titulo)
			provasTrabalhos[i].ConteudosEstudo = strings.TrimSpace(req.ConteudosEstudo)
			provasTrabalhos[i].Anexos = req.Anexos
			provasTrabalhos[i].Referencias = req.Referencias
			provasTrabalhos[i].DataEntrega = req.DataEntrega
			provasTrabalhos[i].MateriaID = req.MateriaID
			provasTrabalhos[i].UpdatedAt = time.Now()

			logUserAction(userID, "UPDATE", fmt.Sprintf("prova-trabalho %d para matéria %s", id, materiaNome))
			writeSuccessResponse(w, "Prova/Trabalho atualizada com sucesso", provasTrabalhos[i])
			return
		}
	}

	log.Printf("Tentativa de atualizar prova/trabalho inexistente: ID %d, User %d", id, userID)
	writeErrorResponse(w, http.StatusNotFound, "NOT_FOUND", "Prova/Trabalho não encontrado ou não pertence ao usuário")
}

func deleteProvaTrabalhoHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	for i, prova := range provasTrabalhos {
		if prova.ID == id && prova.UserID == userID {
			provasTrabalhos = append(provasTrabalhos[:i], provasTrabalhos[i+1:]...)
			logUserAction(userID, "DELETE", fmt.Sprintf("prova-trabalho %d", id))
			writeSuccessResponse(w, "Prova/Trabalho excluído com sucesso", nil)
			return
		}
	}

	log.Printf("Tentativa de excluir prova/trabalho inexistente: ID %d, User %d", id, userID)
	writeErrorResponse(w, http.StatusNotFound, "NOT_FOUND", "Prova/Trabalho não encontrado ou não pertence ao usuário")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "ok",
		"timestamp": time.Now().Format(time.RFC3339),
		"service":   "backend-service",
	})
}

func userStatsHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))

	var userMaterias []Materia
	var userProvas []ProvaTrabalho

	for _, materia := range materias {
		if materia.UserID == userID {
			userMaterias = append(userMaterias, materia)
		}
	}

	for _, prova := range provasTrabalhos {
		if prova.UserID == userID {
			userProvas = append(userProvas, prova)
		}
	}

	// Calcular estatísticas
	totalMaterias := len(userMaterias)
	totalProvas := len(userProvas)
	provasComData := 0
	provasProximas := 0

	for _, prova := range userProvas {
		if prova.DataEntrega != nil {
			provasComData++
			if prova.DataEntrega.After(time.Now()) && prova.DataEntrega.Before(time.Now().Add(7*24*time.Hour)) {
				provasProximas++
			}
		}
	}

	stats := map[string]interface{}{
		"total_materias":     totalMaterias,
		"total_provas":       totalProvas,
		"provas_com_data":    provasComData,
		"provas_proximas":    provasProximas,
		"ultima_atualizacao": time.Now().Format(time.RFC3339),
	}

	logUserAction(userID, "GET", "estatisticas")
	writeSuccessResponse(w, "Estatísticas carregadas com sucesso", stats)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	authServiceURL = os.Getenv("AUTH_SERVICE_URL")
	if authServiceURL == "" {
		authServiceURL = "http://172.20.10.4:8080"
	}

	r := mux.NewRouter()

	// Rota pública
	r.HandleFunc("/health", healthHandler).Methods("GET")

	// Rotas protegidas - Estatísticas
	r.HandleFunc("/stats", authMiddleware(userStatsHandler)).Methods("GET")

	// Rotas protegidas - Matérias
	r.HandleFunc("/materias", authMiddleware(getMateriasHandler)).Methods("GET")
	r.HandleFunc("/materias", authMiddleware(createMateriaHandler)).Methods("POST")
	r.HandleFunc("/materias/{id}", authMiddleware(updateMateriaHandler)).Methods("PUT")
	r.HandleFunc("/materias/{id}", authMiddleware(deleteMateriaHandler)).Methods("DELETE")

	// Rotas protegidas - Provas/Trabalhos
	r.HandleFunc("/provas-trabalhos", authMiddleware(getProvasTrabalhosHandler)).Methods("GET")
	r.HandleFunc("/provas-trabalhos", authMiddleware(createProvaTrabalhoHandler)).Methods("POST")
	r.HandleFunc("/provas-trabalhos/{id}", authMiddleware(updateProvaTrabalhoHandler)).Methods("PUT")
	r.HandleFunc("/provas-trabalhos/{id}", authMiddleware(deleteProvaTrabalhoHandler)).Methods("DELETE")

	// CORS - Configuração para permitir conexões do frontend
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://172.20.10.2:3000",
		"http://172.20.10.2",
	}
	
	// Permitir origens adicionais via variável de ambiente
	if additionalOrigins := os.Getenv("CORS_ADDITIONAL_ORIGINS"); additionalOrigins != "" {
		origins := strings.Split(additionalOrigins, ",")
		for _, origin := range origins {
			allowedOrigins = append(allowedOrigins, strings.TrimSpace(origin))
		}
	}
	
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins(allowedOrigins),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-User-ID"}),
		handlers.AllowCredentials(),
	)(r)

	fmt.Printf("Backend Service rodando na porta %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}
