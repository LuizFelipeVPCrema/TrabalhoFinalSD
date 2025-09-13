import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:8080/register', {
        email: formData.email,
        password: formData.password
      });
      setSuccess('Conta criada com sucesso!');
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data || 'Erro ao criar conta');
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
