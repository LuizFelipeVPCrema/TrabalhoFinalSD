import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const Dashboard = () => {
  const [materias, setMaterias] = useState([]);
  const [provasTrabalhos, setProvasTrabalhos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    
    // Atualizar tempo a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [materiasResponse, provasResponse] = await Promise.all([
        axios.get(`${config.BACKEND_SERVICE_URL}/materias`, { headers }),
        axios.get(`${config.BACKEND_SERVICE_URL}/provas-trabalhos`, { headers })
      ]);

      setMaterias(materiasResponse.data.data || []);
      setProvasTrabalhos(provasResponse.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMaterias([]);
      setProvasTrabalhos([]);
    } finally {
      setLoading(false);
    }
  };

  // Funções para cálculos de tempo
  const getTimeRemaining = (dataEntrega) => {
    if (!dataEntrega) return null;
    
    const now = currentTime;
    const deadline = new Date(dataEntrega);
    const diffTime = deadline - now;
    
    if (diffTime <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 };
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return { expired: false, days, hours, minutes };
  };

  const getTimeStatus = (timeRemaining) => {
    if (!timeRemaining) return 'no-date';
    if (timeRemaining.expired) return 'expired';
    if (timeRemaining.days <= 1) return 'urgent';
    if (timeRemaining.days <= 3) return 'warning';
    return 'safe';
  };

  const formatTimeRemaining = (timeRemaining) => {
    if (!timeRemaining) return 'Sem data definida';
    if (timeRemaining.expired) return 'Prazo expirado';
    
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days} dia${timeRemaining.days > 1 ? 's' : ''} e ${timeRemaining.hours}h`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h e ${timeRemaining.minutes}min`;
    } else {
      return `${timeRemaining.minutes} minutos`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'urgent': return 'URGENTE';
      case 'warning': return 'ATENÇÃO';
      case 'safe': return 'OK';
      case 'expired': return 'EXPIRADO';
      default: return 'SEM PRAZO';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'urgent': return 'Urgente';
      case 'warning': return 'Atenção';
      case 'safe': return 'Tranquilo';
      case 'expired': return 'Expirado';
      default: return 'Sem prazo';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="dashboard-header">
          <h1>Carregando...</h1>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const provasComData = provasTrabalhos?.filter(prova => prova?.data_entrega) || [];
  const provasProximas = provasComData.filter(prova => {
    const timeRemaining = getTimeRemaining(prova.data_entrega);
    return timeRemaining && !timeRemaining.expired && timeRemaining.days <= 7;
  });
  
  const provasUrgentes = provasComData.filter(prova => {
    const timeRemaining = getTimeRemaining(prova.data_entrega);
    return timeRemaining && !timeRemaining.expired && timeRemaining.days <= 1;
  });

  // Ordenar provas por prazo
  const provasOrdenadas = [...provasComData].sort((a, b) => {
    const timeA = getTimeRemaining(a.data_entrega);
    const timeB = getTimeRemaining(b.data_entrega);
    
    if (!timeA && !timeB) return 0;
    if (!timeA) return 1;
    if (!timeB) return -1;
    if (timeA.expired && !timeB.expired) return 1;
    if (!timeA.expired && timeB.expired) return -1;
    
    return (timeA.days * 24 + timeA.hours) - (timeB.days * 24 + timeB.hours);
  });

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Dashboard Acadêmico</h1>
        <p>Sistema de Gestão de Estudos e Prazos</p>
      </div>

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{materias?.length || 0}</h3>
          <p>Disciplinas</p>
        </div>
        <div className="stat-card">
          <h3>{provasTrabalhos?.length || 0}</h3>
          <p>Avaliações</p>
        </div>
        <div className="stat-card">
          <h3>{provasComData.length}</h3>
          <p>Com Prazo</p>
        </div>
        <div className="stat-card">
          <h3>{provasUrgentes.length}</h3>
          <p>Urgentes</p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="content-grid">
        {/* Próximas Provas/Trabalhos */}
        <div className="section-card">
          <h2>
            <span className="section-icon">⏰</span>
            Próximos Prazos
          </h2>
          
          <div className="section-content">
            {provasOrdenadas.length > 0 ? (
              provasOrdenadas.slice(0, 5).map(prova => {
                const timeRemaining = getTimeRemaining(prova.data_entrega);
                const status = getTimeStatus(timeRemaining);
                const materia = materias?.find(m => m.id === prova.materia_id);
                
                return (
                  <div key={prova.id} className={`time-card ${status}`}>
                    <div className="time-info">
                      <h4>{prova.titulo}</h4>
                      <div className="time-remaining">
                        {getStatusIcon(status)} - {formatTimeRemaining(timeRemaining)}
                      </div>
                    </div>
                    <div className="time-details">
                      <strong>Data:</strong> {new Date(prova.data_entrega).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="materia-name">
                      <strong>Disciplina:</strong> {materia?.nome || 'N/A'}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3>Nenhum prazo definido</h3>
                <p>Adicione datas às suas avaliações para acompanhar os prazos</p>
              </div>
            )}
          </div>
          
          <div className="section-actions">
            <Link to="/provas-trabalhos" className="btn btn-primary">
              Ver Todas as Avaliações
            </Link>
          </div>
        </div>

        {/* Matérias Recentes */}
        <div className="section-card">
          <h2>
            <span className="section-icon">📚</span>
            Disciplinas Cadastradas
          </h2>
          
          <div className="section-content">
            {materias?.length > 0 ? (
              materias.slice(0, 4).map(materia => (
                <div key={materia.id} className="card" style={{ marginBottom: '16px', padding: '16px' }}>
                  <h3 style={{ marginBottom: '8px', color: '#2d3748' }}>{materia.nome}</h3>
                  <p style={{ color: '#718096', marginBottom: '8px' }}>{materia.descricao}</p>
                  <small style={{ color: '#a0aec0' }}>
                    Cadastrada em {new Date(materia.created_at).toLocaleDateString('pt-BR')}
                  </small>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <h3>Nenhuma disciplina cadastrada</h3>
                <p>Comece adicionando suas disciplinas do semestre</p>
              </div>
            )}
          </div>
          
          <div className="section-actions">
            {materias?.length > 0 ? (
              <Link to="/materias" className="btn btn-success">
                Gerenciar Disciplinas
              </Link>
            ) : (
              <Link to="/materias" className="btn btn-success">
                Cadastrar Primeira Disciplina
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="section-card" style={{ textAlign: 'center' }}>
        <h2>
          <span className="section-icon">⚡</span>
          Ações Rápidas
        </h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/materias" className="btn btn-primary">
            Nova Disciplina
          </Link>
          <Link to="/provas-trabalhos" className="btn btn-warning">
            Nova Avaliação
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
