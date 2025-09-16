import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuthenticated, loading }) => {
  // Se ainda está carregando, não renderiza nada (o App.js já cuida do loading)
  if (loading) {
    return null;
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se está autenticado, renderiza o componente filho
  return children;
};

export default ProtectedRoute;
