import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5005/api',
    withCredentials: true // Important for sending/receiving Flask session cookies
});

export default api;
