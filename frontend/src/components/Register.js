import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      const response = await axios.post(`${config.AUTH_SERVICE_URL}/register`, {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.token && response.data.user) {
        setSuccess('Conta criada com sucesso!');
        onLogin(response.data.token, response.data.user);
      } else {
        setError('Resposta inválida do servidor');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Este email já está cadastrado');
      } else if (err.response?.status === 400) {
        setError('Dados inválidos. Verifique os campos preenchidos.');
      } else if (err.code === 'ECONNREFUSED') {
        setError('Servidor não está rodando. Verifique se o backend está ativo.');
      } else {
        setError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Registrar</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn">Registrar</button>
        </form>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <p>
          Já tem uma conta? <Link to="/login">Faça login aqui</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
