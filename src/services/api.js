
  import axios from 'axios';

  const api = axios.create({
    baseURL: 'https://api.astralmatch.life/v1/',
  });
  
  export default api;
  