import { ArrowLeft, MapPin, TrendingUp, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function CityDetail({ city, data, onClose }) {
    if (!city) return null;

    // Filter data for the selected city
    const cityData = data?.trends?.find(t => t.city === city) || {
        city,
        job_title: 'Global Analyst',
        demand_score: 75,
        ai_automation_signal: 45
    };

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl z-50 p-10 flex flex-col animate-in slide-in-from-right duration-700">
            <button
                onClick={onClose}
                className="group flex items-center gap-3 text-[10px] font-black text-white px-6 py-3 bg-slate-900/5 border border-white/10 rounded-2xl hover:bg-slate-900/10 transition-all w-fit uppercase tracking-widest mb-12"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Command Center
            </button>

            <div className="flex flex-col lg:flex-row gap-12 flex-1">
                {/* City Identity */}
                <div className="w-full lg:w-1/3 space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-6 h-6 text-primary-400 neon-glow" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Node Location</span>
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter neon-glow uppercase">
                            {city}
                        </h2>
                    </div>

                    <div className="glass-card p-8 border-primary-500/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-white tracking-widest uppercase">Local Signal Strength</h3>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-slate-400 uppercase">Hiring Velocity</span>
                                <span className="text-xl font-black text-white">+14.2%</span>
                            </div>
                            <div className="w-full bg-slate-900/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary-500 h-full w-[72%] shadow-[(/)]"></div>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-slate-400 uppercase">Talent Density</span>
                                <span className="text-xl font-black text-white">92.4</span>
                            </div>
                            <div className="w-full bg-slate-900/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-500 h-full w-[88%] shadow-[(/)]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* City Deep Dive */}
                <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Automation Risk Card */}
                    <div className={`glass-card p-10 flex flex-col justify-center border-l-4 ${cityData.ai_automation_signal > 60 ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className={`w-8 h-8 ${cityData.ai_automation_signal > 60 ? 'text-red-400' : 'text-yellow-400'}`} />
                            <h3 className="text-sm font-black text-white tracking-widest uppercase">AI Attrition Vector</h3>
                        </div>
                        <div className="text-6xl font-black text-white mb-2">{cityData.ai_automation_signal}%</div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
                            {cityData.ai_automation_signal > 60
                                ? 'CRITICAL VULNERABILITY: Massive routinization of local workforce protocols detected.'
                                : 'MODERATE EXPOSURE: Significant augmentation potential identified in primary sectors.'}
                        </p>
                    </div>

                    {/* Market Demand Card */}
                    <div className="glass-card p-10 flex flex-col justify-center border-l-4 border-l-primary-500">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-8 h-8 text-primary-400" />
                            <h3 className="text-sm font-black text-white tracking-widest uppercase">Market Force Score</h3>
                        </div>
                        <div className="text-6xl font-black text-white mb-2">{cityData.demand_score}</div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
                            High-velocity hiring in specialized tech sectors stabilizing core labor indices.
                        </p>
                    </div>

                    {/* Top Roles in City */}
                    <div className="glass-card p-10 col-span-1 md:col-span-2 space-y-8">
                        <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-400" /> Top Deployment Roles
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {['Data Engineering', 'AI Ethics', 'Cloud Architect'].map(role => (
                                <div key={role} className="bg-slate-900/5 border border-white/5 rounded-2xl p-6 hover:border-primary-500/30 transition-all group/role">
                                    <Zap className="w-5 h-5 text-primary-400 mb-4 group-hover/role:scale-110 transition-transform" />
                                    <div className="text-sm font-black text-white uppercase tracking-tight mb-1">{role}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Growth: +22%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
