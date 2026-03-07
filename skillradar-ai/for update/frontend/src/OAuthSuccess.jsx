import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));

                // Save to localStorage
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', token);

                // Redirect to dashboard/home after a brief delay
                setTimeout(() => {
                    navigate('/'); // or '/dashboard' if you have one
                }, 1500);
            } catch (err) {
                console.error("Error parsing user data:", err);
                navigate('/login?error=invalid_oauth_data');
            }
        } else {
            navigate('/login?error=missing_oauth_data');
        }
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass-card p-8 neon-border flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest neon-glow">Authenticating...</h2>
                <p className="text-xs text-slate-400 mt-2 tracking-widest uppercase">Completing secure login</p>
            </div>
        </div>
    );
}
