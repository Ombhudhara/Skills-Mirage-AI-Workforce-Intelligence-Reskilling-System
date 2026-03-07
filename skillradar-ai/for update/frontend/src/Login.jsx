import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:8000/api/auth/login', { email, password });
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = `w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium placeholder-slate-600 outline-none transition-all focus:border-primary-500/60 focus:shadow-[0_0_0_3px_rgba(123,44,191,0.15)] focus:bg-white/8`;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            <div className="relative z-10 w-full max-w-md">
                {/* Card */}
                <div className="glass-card p-8 neon-border">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-700 to-secondary-600 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(123,44,191,0.5)] transition-transform hover:-rotate-6 duration-300 cursor-pointer">
                            <Compass className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white neon-glow uppercase">Welcome Back</h1>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-2">Sign in to Skills Mirage AI</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center tracking-wide uppercase">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-400 transition-colors" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-400 transition-colors" />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="w-full mt-2 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-black text-xs tracking-widest uppercase rounded-xl transition-all shadow-[0_0_25px_rgba(123,44,191,0.4)] hover:shadow-[0_0_35px_rgba(123,44,191,0.6)] flex items-center justify-center gap-2 group disabled:opacity-60">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    {/* OAuth Separator */}
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Or continue with</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <button onClick={() => window.location.href = 'http://localhost:8000/auth/google'}
                            className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[11px] font-bold tracking-wider flex items-center justify-center gap-2 transition-all hover:border-white/20">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button onClick={() => window.location.href = 'http://localhost:8000/auth/github'}
                            className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[11px] font-bold tracking-wider flex items-center justify-center gap-2 transition-all hover:border-white/20">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-5 border-t border-white/5 text-center space-y-3">
                        <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">
                            No account?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors neon-glow">Create Account</Link>
                        </p>
                        <Link to="/" className="block text-[10px] text-slate-600 hover:text-slate-400 font-bold tracking-widest uppercase transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
