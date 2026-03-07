import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5001/api', // Point to Node backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Chatbot messages
export const sendChatMessage = async (chatData) => {
    const response = await apiClient.post('/chatbot/message', chatData);
    return response.data;
};

export default apiClient;
