import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5235',
});

export default apiClient;