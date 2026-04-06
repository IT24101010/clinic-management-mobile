import axios from 'axios';
import { getToken } from '../utils/tokenStorage';
import { API_BASE_URL } from '../constants/config';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Catch unauthorized errors here
            console.log('Unauthorized access detected');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
