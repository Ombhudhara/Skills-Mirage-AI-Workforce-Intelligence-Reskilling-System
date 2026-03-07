import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SkillsIntelligence() {
    const [trends, setTrends] = useState(null);
    const [gap, setGap] = useState(null);
    const [activeTab, setActiveTab] = useState('trends');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [trendsRes, gapRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/skills/trends'),
                axios.get('http://127.0.0.1:8000/api/skills/gap'),
            ]);
            setTrends(trendsRes.data);
            setGap(gapRes.data);
        } catch {
            // Dynamic mock fallback
            setTrends(getMockTrends());
            setGap(getMockGap());
        }
    };

    const getMockTrends = () => ({
        rising_skills: [
            { skill: 'Generative AI', growth: 142 }, { skill: 'LangChain', growth: 98 },
            { skill: 'Prompt Engineering', growth: 87 }, { skill: 'LLM', growth: 76 },
            { skill: 'RAG', growth: 65 }, { skill: 'Vector DB', growth: 58 },
            { skill: 'Kubernetes', growth: 45 }, { skill: 'MLOps', growth: 42 },
            { skill: 'Terraform', growth: 38 }, { skill: 'Rust', growth: 35 },
            { skill: 'Next.js', growth: 32 }, { skill: 'TypeScript', growth: 28 },
            { skill: 'dbt', growth: 25 }, { skill: 'Apache Spark', growth: 22 },
            { skill: 'Snowflake', growth: 20 }, { skill: 'Airflow', growth: 18 },
            { skill: 'FastAPI', growth: 16 }, { skill: 'GraphQL', growth: 14 },
            { skill: 'Docker', growth: 12 }, { skill: 'CI/CD', growth: 10 },
        ],
        declining_skills: [
            { skill: 'Manual Testing', growth: -38 }, { skill: 'Data Entry', growth: -34 },
            { skill: 'VBA/Macros', growth: -28 }, { skill: 'COBOL', growth: -25 },
            { skill: 'jQuery', growth: -22 }, { skill: 'Flash', growth: -20 },
            { skill: 'FoxPro', growth: -18 }, { skill: 'Perl', growth: -16 },
            { skill: 'ColdFusion', growth: -14 }, { skill: 'Delphi', growth: -12 },
            { skill: 'Lotus Notes', growth: -11 }, { skill: 'SOAP', growth: -10 },
            { skill: 'Struts', growth: -9 }, { skill: 'SVN', growth: -8 },
            { skill: 'Backbone.js', growth: -7 }, { skill: 'CoffeeScript', growth: -6 },
            { skill: 'Dreamweaver', growth: -5 }, { skill: 'Silverlight', growth: -4 },
            { skill: 'QBasic', growth: -3 }, { skill: 'Ext.js', growth: -2 },
        ],
    });

    const getMockGap = () => ({
        skill_gap: [
            { skill: 'Python', demand: 3500, supply: 600, gap: 2900 },
            { skill: 'Machine Learning', demand: 2800, supply: 350, gap: 2450 },
            { skill: 'SQL', demand: 3200, supply: 800, gap: 2400 },
            { skill: 'PowerBI', demand: 2100, supply: 150, gap: 1950 },
            { skill: 'Deep Learning', demand: 1900, supply: 200, gap: 1700 },
            { skill: 'Cloud Computing', demand: 2500, supply: 900, gap: 1600 },
            { skill: 'Docker', demand: 1800, supply: 300, gap: 1500 },
            { skill: 'Kubernetes', demand: 1600, supply: 180, gap: 1420 },
            { skill: 'React', demand: 2200, supply: 850, gap: 1350 },
            { skill: 'Data Analytics', demand: 2000, supply: 700, gap: 1300 },
            { skill: 'NLP', demand: 1200, supply: 90, gap: 1110 },
            { skill: 'Tableau', demand: 1400, supply: 350, gap: 1050 },
        ],
    });

    const COLORS_RISE = ['#22c55e', '#16a34a', '#15803d', '#166534'];
    const COLORS_FALL = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic text-primary-500">Skills Intelligence</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[8px] mt-1">Demand Trends & Gap Analysis Engine</p>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-4 bg-slate-900/5 dark:bg-black/20 p-2 rounded-[2rem] border border-black/5 dark:border-white/10 backdrop-blur-xl w-fit">
                {['trends', 'gap'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-primary-600/20' : 'text-slate-500 hover:text-primary-400'}`}>
                        {tab === 'trends' ? '📈 Skill Trends' : '📊 Skill Gap'}
                    </button>
                ))}
            </div>

            {/* Trends Tab */}
            {activeTab === 'trends' && trends && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Rising Skills */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                            <h2 className="text-xl font-black italic tracking-tighter">Rising Skills</h2>
                            <span className="text-[9px] font-black bg-green-500/10 text-green-500 px-3 py-1 rounded-full uppercase tracking-widest">Top 20</span>
                        </div>
                        <div className="h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends.rising_skills} layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" tick={{ fill: "var(--chart-text)", fontSize: 10 }} />
                                    <YAxis dataKey="skill" type="category" tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 'bold' }} width={95} />
                                    <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#fff', fontSize: 12 }}
                                        formatter={(v) => [`+${v}%`, 'Growth']} />
                                    <Bar dataKey="growth" radius={[0, 6, 6, 0]}>
                                        {trends.rising_skills.map((_, i) => (
                                            <Cell key={i} fill={COLORS_RISE[i % COLORS_RISE.length]} fillOpacity={1 - i * 0.03} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Declining Skills */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingDown className="w-6 h-6 text-red-500" />
                            <h2 className="text-xl font-black italic tracking-tighter">Declining Skills</h2>
                            <span className="text-[9px] font-black bg-red-500/10 text-red-500 px-3 py-1 rounded-full uppercase tracking-widest">Top 20</span>
                        </div>
                        <div className="h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends.declining_skills} layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" tick={{ fill: "var(--chart-text)", fontSize: 10 }} />
                                    <YAxis dataKey="skill" type="category" tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 'bold' }} width={95} />
                                    <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#fff', fontSize: 12 }}
                                        formatter={(v) => [`${v}%`, 'Decline']} />
                                    <Bar dataKey="growth" radius={[0, 6, 6, 0]}>
                                        {trends.declining_skills.map((_, i) => (
                                            <Cell key={i} fill={COLORS_FALL[i % COLORS_FALL.length]} fillOpacity={1 - i * 0.03} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Gap Tab */}
            {activeTab === 'gap' && gap && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-6 h-6 text-primary-500" />
                            <h2 className="text-xl font-black italic tracking-tighter">Skill Gap — Demand vs Training Supply</h2>
                        </div>
                        <div className="h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gap.skill_gap} margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="skill" tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 'bold' }} angle={-30} textAnchor="end" height={80} />
                                    <YAxis tick={{ fill: "var(--chart-text)", fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
                                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                                    <Bar dataKey="demand" name="Job Demand" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="supply" name="Training Supply" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gap Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {gap.skill_gap.slice(0, 8).map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                className="glass-card p-6 text-center border-l-4 border-primary-500">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{item.skill}</p>
                                <p className="text-2xl font-black italic text-primary-500">{item.gap.toLocaleString()}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-red-400 mt-1">Shortage</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
