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
      // Reidratar estado imediatamente e validar em segundo plano
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch {}
      }
      setIsAuthenticated(true);

      fetch('http://172.20.10.4:8081/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(async (response) => {
        if (response.status === 401) {
          // Token inválido/expirado confirmado pelo servidor
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
          return null;
        }
        // Para outros erros (ex: 5xx, CORS), não derrubamos a sessão
        try { return await response.json(); } catch { return null; }
      })
      .then((data) => {
        if (data && data.valid && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      })
      .catch((error) => {
        // Erros de rede não derrubam a sessão
        console.warn('Falha ao validar token (mantendo sessão):', error);
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
    if (userData) {
      try { localStorage.setItem('user', JSON.stringify(userData)); } catch {}
    }
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
