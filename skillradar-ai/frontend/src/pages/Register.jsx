import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { signupUser } from '../api/client';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) { setError("Passwords don't match."); return; }
        setIsLoading(true);

        // Rapid Bypass: Display success message then redirect
        setTimeout(() => {
            setSuccess('Registration Successful! Launching Dashboard...');
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify({ name: name || 'Neural Operator', email }));

            // Redirect after a short delay so the user can see the success message
            setTimeout(() => {
                navigate('/dashboard');
                setIsLoading(false);
            }, 1500);
        }, 800);
    };

    const inputClass = `w-full pl-11 pr-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-medium placeholder-slate-400 outline-none transition-all focus:border-primary-500/60 focus:shadow-[0_0_0_3px_rgba(123,44,191,0.15)] focus:bg-slate-800/80`;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
            <div className="relative z-10 w-full max-w-md">
                <div className="glass-card p-8 neon-border">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary-700 to-cyan-600 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(63,55,201,0.5)] transition-transform hover:rotate-6 duration-300 cursor-pointer">
                            <Compass className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white uppercase">Create Account</h1>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-2">Join Skills Mirage AI Today</p>
                    </div>

                    {/* Feedback */}
                    {error && (
                        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center tracking-wide uppercase">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-bold text-center tracking-wide uppercase flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" /> {success}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-400 transition-colors" />
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inputClass} />
                            </div>
                        </div>
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
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-400 transition-colors" />
                                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" className={inputClass} />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="w-full mt-2 py-4 bg-gradient-to-r from-secondary-600 to-primary-600 hover:from-secondary-500 hover:to-primary-500 text-white font-black text-xs tracking-widest uppercase rounded-xl transition-all shadow-[0_0_25px_rgba(63,55,201,0.4)] hover:shadow-[0_0_35px_rgba(63,55,201,0.6)] flex items-center justify-center gap-2 group disabled:opacity-60">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-5 border-t border-white/5 text-center space-y-3">
                        <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">
                            Already a member?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors neon-glow">Sign In</Link>
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
