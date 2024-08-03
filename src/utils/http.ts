import axios from 'axios';

Object.assign(axios.defaults, {
    baseURL: import.meta.env.VITE_BASE_API_URL,
    timeout: 20000,
});

const API_KEY = import.meta.env.VITE_API_KEY;

axios.interceptors.request.use(
    (config) => {
        config.headers['X-API-KEY'] = API_KEY;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axios