package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type User struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Salt      string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

var (
	users      []User
	jwtSecret  = []byte("seu-jwt-secret-super-seguro-aqui")
	nextUserID = 1
)

func generateSalt() (string, error) {
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func hashPassword(password, salt string) (string, error) {
	// Conforme LGPD, usamos hash SHA-256 + salt para criptografia
	hash := sha256.Sum256([]byte(password + salt))
	return hex.EncodeToString(hash[:]), nil
}

func verifyPassword(password, salt, hashedPassword string) bool {
	hash, err := hashPassword(password, salt)
	if err != nil {
		return false
	}
	return hash == hashedPassword
}

func generateJWT(user User) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func validateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("token inválido")
	}

	return claims, nil
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("REGISTER 400 invalid body from %s: %v", r.RemoteAddr, err)
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	// Verificar se email já existe
	for _, user := range users {
		if user.Email == req.Email {
			log.Printf("REGISTER 409 email exists: %s", req.Email)
			http.Error(w, "Email já cadastrado", http.StatusConflict)
			return
		}
	}

	// Gerar salt único
	salt, err := generateSalt()
	if err != nil {
		log.Printf("REGISTER 500 generateSalt error for %s: %v", req.Email, err)
		http.Error(w, "Erro interno", http.StatusInternalServerError)
		return
	}

	// Hash da senha
	hashedPassword, err := hashPassword(req.Password, salt)
	if err != nil {
		log.Printf("REGISTER 500 hashPassword error for %s: %v", req.Email, err)
		http.Error(w, "Erro interno", http.StatusInternalServerError)
		return
	}

	// Criar usuário
	user := User{
		ID:        nextUserID,
		Email:     req.Email,
		Password:  hashedPassword,
		Salt:      salt,
		CreatedAt: time.Now(),
	}

	users = append(users, user)
	nextUserID++

	// Gerar JWT
	token, err := generateJWT(user)
	if err != nil {
		log.Printf("REGISTER 500 generateJWT error for %s: %v", req.Email, err)
		http.Error(w, "Erro interno", http.StatusInternalServerError)
		return
	}

	response := AuthResponse{
		Token: token,
		User:  user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Printf("REGISTER 200 user_id=%d email=%s", user.ID, user.Email)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("LOGIN 400 invalid body from %s: %v", r.RemoteAddr, err)
		http.Error(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	// Buscar usuário
	var user *User
	for i := range users {
		if users[i].Email == req.Email {
			user = &users[i]
			break
		}
	}

	if user == nil {
		log.Printf("LOGIN 401 unknown email: %s", req.Email)
		http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
		return
	}

	// Verificar senha
	if !verifyPassword(req.Password, user.Salt, user.Password) {
		log.Printf("LOGIN 401 wrong password for %s", req.Email)
		http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
		return
	}

	// Gerar JWT
	token, err := generateJWT(*user)
	if err != nil {
		log.Printf("LOGIN 500 generateJWT error for %s: %v", req.Email, err)
		http.Error(w, "Erro interno", http.StatusInternalServerError)
		return
	}

	response := AuthResponse{
		Token: token,
		User:  *user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Printf("LOGIN 200 user_id=%d email=%s", user.ID, user.Email)
}

func validateTokenHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		log.Printf("VALIDATE 401 missing token from %s", r.RemoteAddr)
		http.Error(w, "Token não fornecido", http.StatusUnauthorized)
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := validateToken(tokenString)
	if err != nil {
		log.Printf("VALIDATE 401 invalid token from %s: %v", r.RemoteAddr, err)
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	response := map[string]interface{}{
		"valid":   true,
		"user_id": claims.UserID,
		"email":   claims.Email,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Printf("VALIDATE 200 user_id=%d email=%s", claims.UserID, claims.Email)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// requestLogMiddleware registra método, caminho, status e duração de cada requisição
func requestLogMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		lrw := &loggingResponseWriter{ResponseWriter: w, status: 200}
		next.ServeHTTP(lrw, r)
		duration := time.Since(start)
		log.Printf("HTTP %s %s -> %d (%dB) in %s from %s", r.Method, r.URL.Path, lrw.status, lrw.bytes, duration, r.RemoteAddr)
	})
}

type loggingResponseWriter struct {
	http.ResponseWriter
	status int
	bytes  int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.status = code
	lrw.ResponseWriter.WriteHeader(code)
}

func (lrw *loggingResponseWriter) Write(b []byte) (int, error) {
	n, err := lrw.ResponseWriter.Write(b)
	lrw.bytes += n
	return n, err
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := mux.NewRouter()
	// Middleware de logging básico
	r.Use(requestLogMiddleware)

	// Rotas públicas
	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/register", registerHandler).Methods("POST")
	r.HandleFunc("/login", loginHandler).Methods("POST")
	r.HandleFunc("/validate", validateTokenHandler).Methods("GET")

	// CORS
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(r)

	fmt.Printf("Auth Service rodando na porta %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}
