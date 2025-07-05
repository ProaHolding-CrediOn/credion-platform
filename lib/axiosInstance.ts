import axios from 'axios';
import { useLoadingStore } from './stores/loading';

const api = axios.create({
  baseURL: process.env.CORE_SERVICE_API_URL || 'http://localhost:3000/api',
});

/*let activeRequests = 0;

api.interceptors.request.use(
  (config) => {
    const { setLoading } = useLoadingStore.getState();
    activeRequests++;
    setLoading(true);
    return config;
  },
  (error) => {
    const { setLoading } = useLoadingStore.getState();
    activeRequests = Math.max(activeRequests - 1, 0);
    if (activeRequests === 0) setLoading(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const { setLoading } = useLoadingStore.getState();
    activeRequests = Math.max(activeRequests - 1, 0);
    if (activeRequests === 0) setLoading(false);
    return response;
  },
  (error) => {
    const { setLoading } = useLoadingStore.getState();
    activeRequests = Math.max(activeRequests - 1, 0);
    if (activeRequests === 0) setLoading(false);
    return Promise.reject(error);
  }
);*/

export default api;
