import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProvasTrabalhos = () => {
  const [provasTrabalhos, setProvasTrabalhos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProva, setEditingProva] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    conteudos_estudo: '',
    anexos: '',
    referencias: '',
    data_entrega: '',
    materia_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [provasResponse, materiasResponse] = await Promise.all([
        axios.get('http://172.20.10.3:8080/provas-trabalhos', { headers }),
        axios.get('http://172.20.10.3:8080/materias', { headers })
      ]);

      setProvasTrabalhos(provasResponse.data.data || []);
      setMaterias(materiasResponse.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setProvasTrabalhos([]);
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
      
      const data = {
        ...formData,
        anexos: formData.anexos ? formData.anexos.split('\n').filter(item => item.trim()) : [],
        referencias: formData.referencias ? formData.referencias.split('\n').filter(item => item.trim()) : [],
        data_entrega: formData.data_entrega ? new Date(formData.data_entrega).toISOString() : null,
        materia_id: parseInt(formData.materia_id)
      };
      
      if (editingProva) {
        const response = await axios.put(`http://172.20.10.3:8080/provas-trabalhos/${editingProva.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Prova/Trabalho atualizado:', response.data.message);
      } else {
        const response = await axios.post('http://172.20.10.3:8080/provas-trabalhos', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Prova/Trabalho criado:', response.data.message);
      }
      
      setShowModal(false);
      setEditingProva(null);
      setFormData({
        titulo: '',
        conteudos_estudo: '',
        anexos: '',
        referencias: '',
        data_entrega: '',
        materia_id: ''
      });
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar prova/trabalho:', error);
    }
  };

  const handleEdit = (prova) => {
    setEditingProva(prova);
    setFormData({
      titulo: prova.titulo,
      conteudos_estudo: prova.conteudos_estudo,
      anexos: prova.anexos.join('\n'),
      referencias: prova.referencias.join('\n'),
      data_entrega: prova.data_entrega ? new Date(prova.data_entrega).toISOString().split('T')[0] : '',
      materia_id: prova.materia_id.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta prova/trabalho?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://172.20.10.3:8080/provas-trabalhos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir prova/trabalho:', error);
      }
    }
  };

  const openModal = () => {
    setEditingProva(null);
    setFormData({
      titulo: '',
      conteudos_estudo: '',
      anexos: '',
      referencias: '',
      data_entrega: '',
      materia_id: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProva(null);
    setFormData({
      titulo: '',
      conteudos_estudo: '',
      anexos: '',
      referencias: '',
      data_entrega: '',
      materia_id: ''
    });
  };

  const getMateriaNome = (materiaId) => {
    const materia = materias?.find(m => m.id === materiaId);
    return materia ? materia.nome : 'N/A';
  };

  if (loading) {
    return <div className="container">Carregando...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Provas e Trabalhos</h1>
        <button onClick={openModal} className="btn btn-success">
          Nova Prova/Trabalho
        </button>
      </div>

      <div className="grid">
        {provasTrabalhos?.map(prova => (
          <div key={prova.id} className="item-card">
            <h3>{prova.titulo}</h3>
            <p><strong>Matéria:</strong> {getMateriaNome(prova.materia_id)}</p>
            <p><strong>Conteúdos de Estudo:</strong> {prova.conteudos_estudo}</p>
            {prova.data_entrega && (
              <p><strong>Data de Entrega:</strong> {new Date(prova.data_entrega).toLocaleDateString('pt-BR')}</p>
            )}
            {prova.anexos && prova.anexos?.length > 0 && (
              <p><strong>Anexos:</strong> {prova.anexos.join(', ')}</p>
            )}
            {prova.referencias && prova.referencias?.length > 0 && (
              <p><strong>Referências:</strong> {prova.referencias.join(', ')}</p>
            )}
            <p><small>Criado em: {new Date(prova.created_at).toLocaleDateString('pt-BR')}</small></p>
            <div className="actions">
              <button onClick={() => handleEdit(prova)} className="btn">
                Editar
              </button>
              <button onClick={() => handleDelete(prova.id)} className="btn btn-danger">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!provasTrabalhos || provasTrabalhos.length === 0) && (
        <div className="card">
          <p>Nenhuma prova/trabalho cadastrado. Clique em "Nova Prova/Trabalho" para começar.</p>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProva ? 'Editar Prova/Trabalho' : 'Nova Prova/Trabalho'}</h3>
              <button className="close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="titulo">Título:</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="materia_id">Matéria:</label>
                <select
                  id="materia_id"
                  name="materia_id"
                  value={formData.materia_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma matéria</option>
                  {materias?.map(materia => (
                    <option key={materia.id} value={materia.id}>
                      {materia.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="conteudos_estudo">Conteúdos de Estudo:</label>
                <textarea
                  id="conteudos_estudo"
                  name="conteudos_estudo"
                  value={formData.conteudos_estudo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="anexos">Anexos (um por linha):</label>
                <textarea
                  id="anexos"
                  name="anexos"
                  value={formData.anexos}
                  onChange={handleChange}
                  placeholder="Exemplo:&#10;documento1.pdf&#10;link-importante.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="referencias">Referências (uma por linha):</label>
                <textarea
                  id="referencias"
                  name="referencias"
                  value={formData.referencias}
                  onChange={handleChange}
                  placeholder="Exemplo:&#10;Livro: Autor, Título&#10;Site: www.exemplo.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="data_entrega">Data de Entrega (opcional):</label>
                <input
                  type="date"
                  id="data_entrega"
                  name="data_entrega"
                  value={formData.data_entrega}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-success">
                {editingProva ? 'Atualizar' : 'Criar'}
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

export default ProvasTrabalhos;
