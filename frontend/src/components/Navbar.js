import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="container">
        <h1>Sistema de Estudos</h1>
        <div>
          <span>Olá, {user.email}</span>
          <Link to="/dashboard" className="btn" style={{ marginLeft: '10px' }}>
            Dashboard
          </Link>
          <Link to="/materias" className="btn">
            Matérias
          </Link>
          <Link to="/provas-trabalhos" className="btn">
            Provas/Trabalhos
          </Link>
          <button onClick={onLogout} className="btn" style={{ marginLeft: '10px' }}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
