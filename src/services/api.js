
  import axios from 'axios';

  const api = axios.create({
    baseURL: 'https://api.match.diegoqueiroz.dev/v1/', // Adicione 'http://' ou 'https://'
  });
  
  export default api;
  