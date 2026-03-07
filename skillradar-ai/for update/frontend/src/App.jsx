import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import OAuthSuccess from './OAuthSuccess';
import ChatbotWidget from './components/ChatbotWidget';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/oauth-success" element={<OAuthSuccess />} />
            </Routes>
            <ChatbotWidget />
        </BrowserRouter>
    );
}

export default App;
