import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Compass,
    User,
    RefreshCw,
    ArrowRight,
    Globe,
    Zap,
    Shield,
    TrendingUp,
    BookOpen,
    Brain,
    ChevronDown,
    Radio,
    Sun,
    Moon
} from 'lucide-react';

function useCounter(target, duration = 2000) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let start = 0;
                const step = target / (duration / 16);
                const timer = setInterval(() => {
                    start += step;
                    if (start >= target) { setCount(target); clearInterval(timer); }
                    else setCount(Math.floor(start));
                }, 16);
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);
    return [count, ref];
}

function StatCard({ value, label, suffix = '' }) {
    const [count, ref] = useCounter(value);
    return (
        <div ref={ref} className="glass-card p-6 text-center group hover:border-primary-500/30 transition-all">
            <div className="text-3xl font-black text-white neon-glow mb-1">{count.toLocaleString()}{suffix}</div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">{label}</div>
        </div>
    );
}

function useSpotlight() {
    useEffect(() => {
        let animationFrameId;
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;

        const handleMouseMove = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            currentX += (targetX - currentX) * 0.15;
            currentY += (targetY - currentY) * 0.15;

            document.documentElement.style.setProperty('--mouseX', `${currentX}px`);
            document.documentElement.style.setProperty('--mouseY', `${currentY}px`);

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
}

const useTheme = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return [theme, setTheme];
};

export default function Home() {
    const [tick, setTick] = useState(0);
    const [theme, setTheme] = useTheme();
    useEffect(() => {
        const t = setInterval(() => setTick(v => v + 1), 2000);
        return () => clearInterval(t);
    }, []);

    useSpotlight();

    const handleEnterPlatform = () => {
        window.location.href = '/register';
    };

    return (
        <div className="min-h-screen text-white font-sans bg-[var(--bg-color)]">
            {/* ── Glowing Spotlight Sphere ── */}
            <div
                className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none mix-blend-screen opacity-30 z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(123,44,191,0.4) 0%, transparent 70%)',
                    transform: 'translate(calc(var(--mouseX, 50vw) - 200px), calc(var(--mouseY, 50vh) - 200px))'
                }}
            />

            {/* ── Watermark Base ── */}
            <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center select-none overflow-hidden text-[22vw] font-black tracking-tighter leading-none text-white/5 whitespace-nowrap">
                MIRAGE
            </div>

            {/* ── Watermark Spotlight Highlight ── */}
            <div
                className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center select-none overflow-hidden text-[22vw] font-black tracking-tighter leading-none whitespace-nowrap"
                style={{
                    color: '#a855f7', // Purple 500
                    textShadow: '0 0 60px rgba(123,44,191,0.6)',
                    WebkitMaskImage: 'radial-gradient(200px circle at var(--mouseX, 50vw) var(--mouseY, 50vh), black 0%, transparent 100%)',
                    maskImage: 'radial-gradient(200px circle at var(--mouseX, 50vw) var(--mouseY, 50vh), black 0%, transparent 100%)'
                }}
            >
                MIRAGE
            </div>

            {/* ── NAV ── */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-5 max-w-screen-xl mx-auto border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center shadow-[0_0_20px_rgba(123,44,191,0.5)] transition-transform hover:rotate-12 duration-300">
                        <Compass className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-black text-sm tracking-[0.2em] text-white uppercase block leading-none neon-glow">Skills Mirage</span>
                        <span className="text-[9px] text-primary-400 font-bold tracking-[0.25em] uppercase">AI Workforce</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'About Solution', 'Impact'].map(link => (
                        <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`}
                            className="text-slate-400 hover:text-white text-xs font-bold tracking-widest uppercase transition-colors">
                            {link}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button onClick={handleEnterPlatform} className="text-slate-400 hover:text-white text-xs font-bold tracking-widest uppercase transition-colors">
                        Sign In
                    </button>
                    <button onClick={handleEnterPlatform}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(123,44,191,0.4)] hover:shadow-[0_0_30px_rgba(123,44,191,0.6)]">
                        Get Started <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4 max-w-5xl mx-auto pt-16 pb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-[0.2em] text-primary-400 uppercase mb-10 backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(123,44,191,0.8)]" />
                    The Future of Workforce Intelligence
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    Decode the{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Job Market.</span>
                    <br />
                    Empower the{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-cyan-400">Workforce.</span>
                </h1>

                <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed mb-12 font-medium tracking-wide animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    A real-time AI platform analyzing Naukri job signals, detecting skill gaps, and generating personalized reskilling roadmaps powered by NPTEL &amp; SWAYAM — built for India's digital transformation.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                    <button onClick={handleEnterPlatform}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-black text-xs tracking-widest uppercase rounded-2xl hover:from-primary-500 hover:to-secondary-500 transition-all shadow-[0_0_30px_rgba(123,44,191,0.35)] hover:shadow-[0_0_50px_rgba(123,44,191,0.5)] group">
                        Enter Platform
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a href="#about-solution"
                        className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-white/10 hover:border-primary-500/30 transition-all backdrop-blur-sm">
                        Explore System <ChevronDown className="w-4 h-4" />
                    </a>
                </div>

                {/* Live status bar */}
                <div className="mt-16 flex items-center gap-6 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md shadow-xl">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">Live Engine Active</span>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                        <Radio className="w-3.5 h-3.5 text-primary-400" />
                        Naukri · NPTEL · SWAYAM
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section id="impact" className="relative z-10 py-16 max-w-screen-xl mx-auto px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard value={50000} label="Jobs Analyzed" suffix="+" />
                    <StatCard value={1200} label="NPTEL Courses" suffix="+" />
                    <StatCard value={85} label="Prediction Accuracy" suffix="%" />
                    <StatCard value={340} label="Skills Tracked" suffix="+" />
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="relative z-10 py-20 max-w-screen-xl mx-auto px-8">
                <div className="text-center mb-14">
                    <p className="text-[10px] font-black tracking-[0.3em] text-primary-400 uppercase mb-3">Core Capabilities</p>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter neon-glow">Intelligence Pillars</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: Globe, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20', glow: 'hover:shadow-[0_0_30px_rgba(123,44,191,0.2)]', title: 'Market Dashboard', desc: 'Real-time ingestion of 50,000+ Naukri postings — extract emerging skills, declining trends, salary benchmarks, and city-level demand hotspots.', tags: ['Trend Analysis', 'Demand Heatmap', 'Salary Insight'] },
                        { icon: User, color: 'text-secondary-400', bg: 'bg-secondary-500/10 border-secondary-500/20', glow: 'hover:shadow-[0_0_30px_rgba(63,55,201,0.2)]', title: 'Worker Intelligence', desc: 'Upload your resume for AI skill extraction, get an automation risk score, gap analysis vs market demand, and ranked career pivot paths.', tags: ['Resume Parsing', 'Risk Score', 'Gap Analysis'] },
                        { icon: RefreshCw, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', glow: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]', title: 'Reskilling Engine', desc: 'Day-by-day learning roadmaps using curated NPTEL/SWAYAM courses, mapped to your exact skill gaps with progress tracking.', tags: ['Day-wise Plan', 'NPTEL Mapped', 'Progress Track'] },
                    ].map(({ icon: Icon, color, bg, glow, title, desc, tags }) => (
                        <div key={title} className={`glass-card p-8 group cursor-default transition-all ${glow} hover:translate-y-[-5px]`}>
                            <div className={`w-12 h-12 ${bg} border rounded-2xl flex items-center justify-center mb-6 ${color} group-hover:scale-110 transition-transform shadow-lg`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-black tracking-widest uppercase text-white mb-3 neon-glow">{title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4 tracking-wide">{desc}</p>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(t => (
                                    <span key={t} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black tracking-widest uppercase text-slate-500">{t}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ABOUT SOLUTION ── */}
            <section id="about-solution" className="relative z-10 py-20 max-w-screen-xl mx-auto px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase mb-3">About the Solution</p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 neon-glow">
                            Built for India's<br />Evolving Job Market
                        </h2>
                        <p className="text-slate-400 leading-relaxed tracking-wide mb-4 text-sm">
                            India is undergoing rapid technological transformation. Millions of workers face automation risk while AI, cloud, and data science demand surges ahead. Skills Mirage bridges this gap with ruthlessly accurate workforce intelligence.
                        </p>
                        <p className="text-slate-400 leading-relaxed tracking-wide mb-8 text-sm">
                            We process live Naukri postings, cross-reference NPTEL/SWAYAM course libraries, and use NLP to generate hyper-personalized reskilling paths — so no worker gets left behind.
                        </p>
                        <div className="space-y-3">
                            {[
                                'Real Naukri data — not synthetic datasets',
                                'Powered by advanced NLP skill extraction',
                                'Aligned to National Reskilling programmes',
                                'Hindi language chatbot for regional access',
                            ].map(item => (
                                <div key={item} className="flex items-center gap-3 text-sm text-slate-300 tracking-wide">
                                    <div className="w-5 h-5 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(123,44,191,0.3)]">
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#b06be0" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Brain, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20', title: 'AI-Powered NLP', desc: 'Extracts skills from 50K+ postings' },
                            { icon: Shield, color: 'text-secondary-400', bg: 'bg-secondary-500/10 border-secondary-500/20', title: 'Accurate Risk', desc: '85%+ automation vulnerability prediction' },
                            { icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', title: 'Live Intel', desc: 'Real-time Naukri India signals' },
                            { icon: BookOpen, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', title: 'Curated Paths', desc: 'NPTEL courses mapped to your gaps' },
                        ].map(({ icon: Icon, color, bg, title, desc }) => (
                            <div key={title} className="glass-card p-5 group hover:border-primary-500/20 transition-all hover:scale-[1.02]">
                                <div className={`w-10 h-10 ${bg} border rounded-xl flex items-center justify-center mb-4 ${color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="text-xs font-black tracking-widest uppercase text-white mb-1">{title}</div>
                                <div className="text-[11px] text-slate-500 font-bold leading-relaxed tracking-wide">{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative z-10 py-20 max-w-3xl mx-auto px-8 text-center">
                <div className="glass-card p-12 neon-border">
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(123,44,191,0.8)] mx-auto mb-6" />
                    <h2 className="text-3xl font-black tracking-tighter mb-4 neon-glow">Future-proof your career</h2>
                    <p className="text-slate-400 text-sm leading-relaxed tracking-wide mb-8">
                        Join professionals using Skills Mirage to decode the job market and navigate careers with confidence.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={handleEnterPlatform}
                            className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-black text-xs tracking-widest uppercase rounded-xl hover:from-primary-500 hover:to-secondary-500 transition-all shadow-[0_0_25px_rgba(123,44,191,0.4)]">
                            Create Free Account
                        </button>
                        <button onClick={handleEnterPlatform}
                            className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-black text-xs tracking-widest uppercase rounded-xl hover:bg-white/10 hover:border-white/20 transition-all">
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="relative z-10 border-t border-white/5 py-6 text-center max-w-screen-xl mx-auto px-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Compass className="w-4 h-4 text-primary-400" />
                    <span className="text-xs font-black tracking-[0.2em] uppercase text-slate-400 neon-glow">Skills Mirage</span>
                </div>
                <p className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">AI Workforce Intelligence · Built for India's Digital Future</p>
            </footer>
        </div>
    );
}
