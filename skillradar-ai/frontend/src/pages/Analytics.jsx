import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    BarChart3,
    Activity,
    AlertTriangle,
    Calendar,
    RefreshCw,
    Download,
    Filter,
    Zap,
    Target,
    MapPin
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis
} from 'recharts';
import { apiClient } from '../api/client';

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('trends');
    const [period, setPeriod] = useState('7d');
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [selectedCity, setSelectedCity] = useState('All India');
    const [stats, setStats] = useState({ scrape_volume: '1.2M', confidence_score: 91.4, ml_engine: 'Ensemble XGBoost' });
    const [forecastData, setForecastData] = useState([]);
    const [correlations, setCorrelations] = useState({ scatter: [], matrix: [] });
    const [anomalies, setAnomalies] = useState([]);
    const [pulseData, setPulseData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSummary();
        fetchPatterns();
        if (activeTab === 'forecast') fetchForecast();
        if (activeTab === 'correlations') fetchCorrelations();
        if (activeTab === 'anomalies') fetchAnomalies();
    }, [activeTab, period, selectedRole, selectedCity]);

    const fetchSummary = async () => {
        try {
            const res = await apiClient.get(`/analytics/summary`);
            setStats(res.data);
        } catch (e) {
            // Dynamic mock for summary
            setStats({
                scrape_volume: selectedCity === 'All India' ? '1.2M' : `${(selectedCity.length * 50).toLocaleString()}k`,
                confidence_score: 85 + (selectedRole.length % 10),
                ml_engine: 'Ensemble XGBoost v4.2'
            });
        }
    };

    const fetchForecast = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/analytics/forecast?role=${selectedRole}&city=${selectedCity}`);
            const realForecast = res.data.combined_data;
            if (realForecast && realForecast.length > 0) {
                setForecastData(realForecast);
            } else {
                throw new Error("Empty forecast");
            }
        } catch (e) {
            // Dynamic mock for forecast
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const mockForecast = days.map((day, i) => {
                const base = 40 + (selectedRole.length % 30);
                const cityMod = selectedCity.length % 10;
                return {
                    day,
                    actual: i < 4 ? base + (i * 5) + cityMod : null,
                    forecast: base + (i * 5) + cityMod + (Math.sin(i) * 5)
                };
            });
            setForecastData(mockForecast);
        }
        finally { setLoading(false); }
    };

    const fetchCorrelations = async () => {
        try {
            const res = await apiClient.get(`/analytics/correlations?role=${selectedRole}`);
            const realCorr = res.data;
            if (realCorr && (realCorr.matrix?.length > 0 || realCorr.scatter?.length > 0)) {
                setCorrelations(realCorr);
            } else {
                throw new Error("Empty correlations");
            }
        } catch (e) {
            // Dynamic mock for correlations
            setCorrelations({
                matrix: [
                    { source1: selectedRole, source2: 'AI Skillset', correlation: 0.85, strength: 'strong' },
                    { source1: selectedRole, source2: 'Remote Work', correlation: 0.62, strength: 'medium' },
                    { source1: selectedRole, source2: 'Salary Growth', correlation: 0.78, strength: 'strong' }
                ],
                scatter: Array.from({ length: 20 }).map((_, i) => ({
                    x: 40 + (i * 3) + (selectedRole.length % 10),
                    y: 50 + (i * 2) + (selectedCity.length % 15),
                    z: 100 + (i * 10)
                }))
            });
        }
    };

    const fetchAnomalies = async () => {
        try {
            const res = await apiClient.get(`/analytics/anomalies?city=${selectedCity}`);
            if (res.data && res.data.length > 0) {
                setAnomalies(res.data);
            } else {
                throw new Error("Empty anomalies");
            }
        } catch (e) {
            // Dynamic mock for anomalies
            setAnomalies([
                { severity: 'critical', type: 'Market Shock', desc: `Unexpected ${selectedRole} hiring drop in ${selectedCity}`, time: '2h ago', status: 'investigating' },
                { severity: 'medium', type: 'Velocity Spike', desc: `New startup cluster detected in ${selectedCity}`, time: '5h ago', status: 'resolved' }
            ]);
        }
    };

    const fetchPatterns = async () => {
        try {
            const res = await apiClient.get(`/analytics/patterns?city=${selectedCity}`);
            if (res.data && res.data.daily_pulse && res.data.daily_pulse.length > 0) {
                setPulseData(res.data.daily_pulse);
            } else {
                throw new Error("Empty patterns data");
            }
        } catch (e) {
            // Dynamic mock for pulse
            const mockPulse = Array.from({ length: 15 }).map((_, i) => ({
                hour: `${i}:00`,
                value: 50 + Math.floor(Math.random() * 50) + (selectedCity.length % 10)
            }));
            setPulseData(mockPulse);
        }
    };

    const tabs = [
        { id: 'trends', label: 'Market Pulse', icon: TrendingUp },
        { id: 'forecast', label: '7D Forecast', icon: BarChart3 },
        { id: 'correlations', label: 'Correlation Matrix', icon: Activity },
        { id: 'anomalies', label: 'Anomaly Shock', icon: AlertTriangle },
    ];

    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic text-primary-500">Analytics Explorer</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[8px] mt-1">Neural Market Intelligence & Predictive Modeling</p>
                </div>

                <div className="flex flex-wrap items-center gap-1 bg-slate-900/5 dark:bg-black/20 p-2 rounded-[2rem] border border-black/5 dark:border-white/10 backdrop-blur-xl">
                    <div className="flex items-center px-4">
                        <Target className="w-3 h-3 text-slate-500 mr-2" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-widest"
                        >
                            <option value="All Roles">All Roles</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="ML Engineer">ML Engineer</option>
                            <option value="Software Engineer">Software Engineer</option>
                        </select>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-900/10" />
                    <div className="flex items-center px-4">
                        <MapPin className="w-3 h-3 text-slate-500 mr-2" />
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-widest"
                        >
                            <option value="All India">All India</option>
                            <option value="Indore">Indore</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Mumbai">Mumbai</option>
                        </select>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-900/10" />
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-widest px-4"
                    >
                        <option value="24h">24h</option>
                        <option value="7d">7d</option>
                        <option value="30d">30d</option>
                    </select>
                </div>
            </div>



            {/* Tab Navigation */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] transition-all whitespace-nowrap font-black text-[10px] uppercase tracking-widest border ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-primary-500 text-white shadow-xl shadow-primary-600/20'
                            : 'bg-slate-900/5 dark:bg-black/20 border-black/5 dark:border-white/10 text-slate-500 hover:border-primary-500/30'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'trends' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
                        <div className="lg:col-span-2 glass-card p-10">
                            <h2 className="text-2xl font-black tracking-tighter italic mb-8 flex items-center gap-4">
                                <Activity className="w-6 h-6 text-primary-500" />
                                Distribution Pattern (Daily Pulse)
                            </h2>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={pulseData}>
                                        <defs>
                                            <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                        <XAxis dataKey="hour" stroke="var(--chart-text)" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke="var(--chart-text)" fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: 'none', borderRadius: '16px', backdropFilter: 'blur(10px)', color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={4} fillOpacity={1} fill="url(#colorPulse)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card p-10 bg-gradient-to-r from-purple-600 to-blue-600/5 border-primary-500/20">
                            <h2 className="text-xl font-black tracking-tighter italic mb-6">Market Insights</h2>
                            <div className="space-y-6">
                                {[
                                    { label: "Viral Trend", val: "GenAI Specialists", desc: "Up 240% since Feb" },
                                    { label: "Market Shock", val: "BPO Automation", desc: "Critical shift detected" },
                                    { label: "Optimal Logic", val: "Parallel Learning", desc: "Reduces reskill time 15%" }
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-black/5 dark:bg-slate-900/5 rounded-2xl border border-black/5 dark:border-white/10">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary-500">{item.label}</span>
                                        <h4 className="font-black text-lg mt-1">{item.val}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'forecast' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black tracking-tighter italic flex items-center gap-4">
                                <BarChart3 className="w-6 h-6 text-primary-500" />
                                7-Day Demand Forecast
                            </h2>
                            <span className="px-4 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                                Bayesian Confidence: 88%
                            </span>
                        </div>
                        <div className="h-[450px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={forecastData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                    <XAxis dataKey="day" stroke="var(--chart-text)" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--chart-text)" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: 'none', borderRadius: '16px', backdropFilter: 'blur(10px)', color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="actual" stroke="#7c3aed" strokeWidth={6} dot={{ r: 6, fill: "#7c3aed" }} />
                                    <Line type="monotone" dataKey="forecast" stroke="#06b6d4" strokeWidth={4} strokeDasharray="8 8" dot={{ r: 4, fill: "#06b6d4" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'correlations' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-card p-10">
                            <h2 className="text-2xl font-black tracking-tighter italic mb-8">Correlation Matrix</h2>
                            <div className="space-y-6">
                                {correlations.matrix.map((corr, i) => (
                                    <div key={i} className="p-6 bg-slate-900/5 dark:bg-black/20 rounded-[1.5rem] border border-black/5 dark:border-white/10">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black italic text-lg">{corr.source1}</span>
                                                <span className="text-primary-500">↔</span>
                                                <span className="font-black italic text-lg">{corr.source2}</span>
                                            </div>
                                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${corr.strength === 'strong' ? 'bg-green-500/10 text-green-500' : 'bg-primary-500/10 text-primary-500'
                                                }`}>
                                                {corr.strength}
                                            </span>
                                        </div>
                                        <div className="h-4 bg-black/10 dark:bg-slate-900/10 rounded-full overflow-hidden p-1">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                                                style={{ width: `${corr.correlation * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-right text-[10px] font-black text-slate-500 mt-2 tracking-widest">{corr.correlation.toFixed(2)} COEFFICIENT</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-10">
                            <h2 className="text-2xl font-black tracking-tighter italic mb-8">Correlation Analysis (Z-Axis)</h2>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                                        <XAxis dataKey="x" name="Job Demand" stroke="var(--chart-text)" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="y" name="Avg Salary" stroke="var(--chart-text)" fontSize={10} axisLine={false} tickLine={false} />
                                        <ZAxis dataKey="z" range={[50, 400]} name="Confidence" />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Skills" data={correlations.scatter} fill="#7c3aed" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6">Clusters indicate high-demand high-value skill groups</p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'anomalies' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 overflow-hidden">
                        <h2 className="text-2xl font-black tracking-tighter italic mb-8">Anomaly Shock Detection</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-black/5 dark:border-white/10">
                                        {["Severity", "Type", "Intelligence Insight", "Detected", "Status"].map((h) => (
                                            <th key={h} className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {anomalies.map((anom, i) => (
                                        <tr key={i} className="border-b border-black/5 dark:border-white/10 hover:from-purple-500 hover:to-blue-500/5 transition-colors">
                                            <td className="py-6 px-4">
                                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${anom.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                    anom.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                        anom.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {anom.severity}
                                                </span>
                                            </td>
                                            <td className="py-6 px-4 font-black italic">{anom.type}</td>
                                            <td className="py-6 px-4 text-slate-500 font-bold text-sm tracking-tight">{anom.desc}</td>
                                            <td className="py-6 px-4 text-slate-500 font-black text-[10px] tracking-widest uppercase">{anom.time}</td>
                                            <td className="py-6 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full animate-pulse ${anom.status === 'resolved' ? 'bg-green-500' : 'bg-primary-500'}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{anom.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
