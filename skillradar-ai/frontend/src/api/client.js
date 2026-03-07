import axios from 'axios';

// Set up base Axios instance pointing to FastAPI backend
const apiClient = axios.create({
    baseURL: 'http://localhost:8001/api', // FastAPI default URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = async (credentials) => {
    // FastAPI OAuth2 expects form data for login
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await apiClient.post('/auth/login', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const signupUser = async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
};

export const getMe = async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};

export { apiClient };

// Dashboard Data
export const getDashboardData = async (city = '', role = '', timePeriod = '6 Months') => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (role) params.append('role', role);
    if (timePeriod) params.append('time_period', timePeriod);

    const queryString = params.toString();
    const url = `/dashboard/data${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
};

// Get Reskilling Timeline
export const getReskillingTimeline = async (city = 'All India', targetRole = 'Data Scientist') => {
    const params = new URLSearchParams();
    params.append('city', city);
    params.append('target_role', targetRole);

    const response = await apiClient.get(`/dashboard/timeline?${params.toString()}`);
    return response.data;
};

// Intelligence Evaluation
export const evaluateWorkerProfile = async (profileData) => {
    const response = await apiClient.post('/intelligence/evaluate', profileData);
    return response.data;
};

// Reskilling Paths
export const getReskillingPath = async (requestData) => {
    const response = await apiClient.post('/reskilling/path', requestData);
    return response.data;
};

// Chatbot messages (Pointing to the new Node.js backend on port 5001)
export const sendChatMessage = async (chatData) => {
    const response = await axios.post('http://localhost:5001/api/chatbot/message', chatData);
    return response.data;
};

// Salary Intelligence
export const getSalaryIntelligence = async (role = 'All Roles') => {
    const response = await apiClient.get(`/labour_market/salary-intelligence?role=${encodeURIComponent(role)}`);
    return response.data;
};
