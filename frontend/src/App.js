import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Materias from './components/Materias';
import ProvasTrabalhos from './components/ProvasTrabalhos';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar se o token ainda é válido
      fetch('http://localhost:8080/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Token inválido');
        }
        return response.json();
      })
      .then(data => {
        if (data.valid && data.user) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.error('Erro na validação do token:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        // Se o token estiver expirado, mostrar mensagem
        if (error.message === 'Token inválido') {
          console.log('Token expirado ou inválido. Redirecionando para login.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    // Forçar redirecionamento para login
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Verificando autenticação...</h2>
          <p>Por favor, aguarde enquanto validamos seu token de acesso.</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Register onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/materias" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                <Materias />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provas-trabalhos" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                <ProvasTrabalhos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
