import axios from 'axios';
import StorageService from '../store/store';

const api = axios.create({
  baseURL: 'https://api.astralmatch.life/v1/',
});

// Interceptor de resposta para capturar erro 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      // Exemplo: Limpar storage e recarregar app
      //await StorageService.clearAll();

      console.log('Sessão expirada');
      // Você pode também redirecionar para o login, exibir modal, etc.
      // window.location.reload(); // Em web
      // Ou emitir um evento global, ou usar navegação do React Navigation
      // Exemplo: Alert.alert('Sessão expirada', 'Faça login novamente.');
      // Se usar navegação global, pode emitir um evento ou usar um handler global
    }
    return Promise.reject(error);
  }
);

export default api;
  