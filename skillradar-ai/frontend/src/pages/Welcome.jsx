import { useNavigate } from 'react-router-dom';
import { Compass, BarChart3, ShieldAlert, RefreshCw, Globe, ArrowRight, Sparkles, Zap, Brain, Target, TrendingUp } from 'lucide-react';
import BackgroundEffect from '../components/BackgroundEffect';

const features = [
    {
        icon: TrendingUp,
        title: 'Hiring Trends 2026',
        desc: "Live hiring velocity analysis from across India's emerging tech corridors.",
        color: 'from-blue-600 to-cyan-500',
    },
    {
        icon: Brain,
        title: 'Cognitive Automation Risk',
        desc: 'Deep-learning based displacement scoring for 450+ modern job roles.',
        color: 'from-purple-600 to-indigo-500',
    },
    {
        icon: Target,
        title: 'Neural Skill Gaps',
        desc: 'Identifying friction between academic supply and industrial demand.',
        color: 'from-amber-500 to-orange-600',
    },
    {
        icon: RefreshCw,
        title: 'Adaptive Reskilling',
        desc: 'Dynamic career transition paths powered by real-time market signals.',
        color: 'from-emerald-500 to-teal-600',
    },
];

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#02040a]">
            <BackgroundEffect />

            {/* Premium Glow Overlays */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

            {/* Mesh Background Accent */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            {/* Main Content Hero */}
            <div className="relative z-10 text-center px-6 max-w-6xl mx-auto pt-20 pb-20">
                {/* Status Badge */}
                <div className="inline-flex items-center gap-3 bg-slate-900/5 border border-white/10 backdrop-blur-xl px-6 py-2 rounded-full mb-12 animate-in fade-in zoom-in duration-1000">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></div>
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">System Live: Processing 15k+ Signals</span>
                </div>

                {/* Main Logo & Title */}
                <div className="flex flex-col items-center gap-6 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-3xl blur-xl group-hover:bg-purple-500/40 transition-all"></div>
                        <Compass className="w-16 h-16 text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-tight">
                        SKILLS<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-blue-400">MIRAGE</span>
                    </h1>
                </div>

                {/* High Contrast Subtext */}
                <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-tight mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    India's First Layer-1 Workforce Intelligence Platform
                </h2>

                <p className="text-lg text-slate-300 font-medium max-w-2xl mx-auto mb-16 leading-relaxed opacity-80 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
                    Bridging the divide between academic potential and market reality through real-time neural data extraction and predictive automation modeling.
                </p>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <button
                        onClick={() => navigate('/register')}
                        className="group relative px-12 py-5 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.25em] rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-3 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Zap className="w-5 h-5 fill-black" />
                        Launch Interface
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/register')}
                        className="px-12 py-5 bg-slate-900/5 border border-white/20 backdrop-blur-xl text-white font-black text-sm uppercase tracking-[0.25em] rounded-2xl hover:bg-slate-900/10 hover:border-white/40 transition-all duration-300 flex items-center gap-3 border-glow shadow-inner"
                    >
                        Market Intelligence
                    </button>
                </div>
            </div>

            {/* Feature Matrix */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feat, i) => (
                        <div
                            key={feat.title}
                            className="group relative p-10 bg-slate-900/[0.02] border border-white/10 backdrop-blur-md rounded-[2.5rem] hover:bg-slate-900/[0.05] hover:border-white/20 transition-all duration-500 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000"
                            style={{ animationDelay: `${700 + i * 150}ms` }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-slate-900/10 transition-colors"></div>

                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${feat.color} w-fit mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                <feat.icon className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 group-hover:text-purple-400 transition-colors">{feat.title}</h3>
                            <p className="text-[14px] text-white/50 font-semibold leading-relaxed group-hover:text-white/80 transition-all">{feat.desc}</p>

                            <div className="mt-8 flex items-center justify-between">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Operational</span>
                                <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                                    <div className="w-1 h-1 rounded-full bg-slate-900/30 group-hover:bg-slate-900 transition-colors"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Global Accent */}
            <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20"></div>
        </div>
    );
}
