import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Materias = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMateria, setEditingMateria] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });

  useEffect(() => {
    fetchMaterias();
  }, []);

  const fetchMaterias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8081/materias', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterias(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar matérias:', error);
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingMateria) {
        const response = await axios.put(`http://localhost:8081/materias/${editingMateria.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Matéria atualizada:', response.data.message);
      } else {
        const response = await axios.post('http://localhost:8081/materias', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Matéria criada:', response.data.message);
      }
      
      setShowModal(false);
      setEditingMateria(null);
      setFormData({ nome: '', descricao: '' });
      fetchMaterias();
    } catch (error) {
      console.error('Erro ao salvar matéria:', error);
    }
  };

  const handleEdit = (materia) => {
    setEditingMateria(materia);
    setFormData({
      nome: materia.nome,
      descricao: materia.descricao
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta matéria?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8081/materias/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchMaterias();
      } catch (error) {
        console.error('Erro ao excluir matéria:', error);
      }
    }
  };

  const openModal = () => {
    setEditingMateria(null);
    setFormData({ nome: '', descricao: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMateria(null);
    setFormData({ nome: '', descricao: '' });
  };

  if (loading) {
    return <div className="container">Carregando...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Matérias</h1>
        <button onClick={openModal} className="btn btn-success">
          Nova Matéria
        </button>
      </div>

      <div className="grid">
        {materias?.map(materia => (
          <div key={materia.id} className="item-card">
            <h3>{materia.nome}</h3>
            <p>{materia.descricao}</p>
            <p><small>Criado em: {new Date(materia.created_at).toLocaleDateString('pt-BR')}</small></p>
            <div className="actions">
              <button onClick={() => handleEdit(materia)} className="btn">
                Editar
              </button>
              <button onClick={() => handleDelete(materia.id)} className="btn btn-danger">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!materias || materias.length === 0) && (
        <div className="card">
          <p>Nenhuma matéria cadastrada. Clique em "Nova Matéria" para começar.</p>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingMateria ? 'Editar Matéria' : 'Nova Matéria'}</h3>
              <button className="close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nome">Nome:</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="descricao">Descrição:</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-success">
                {editingMateria ? 'Atualizar' : 'Criar'}
              </button>
              <button type="button" onClick={closeModal} className="btn">
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materias;
