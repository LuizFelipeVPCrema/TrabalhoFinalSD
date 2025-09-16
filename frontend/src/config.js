// Configuração das URLs dos serviços
const config = {
  AUTH_SERVICE_URL: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://172.20.10.4:8080',
  BACKEND_SERVICE_URL: process.env.REACT_APP_BACKEND_SERVICE_URL || 'http://172.20.10.3:8081'
};

export default config; 