import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Building2, MapPin, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const CITIES = [
    'All India', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad',
    'Jaipur', 'Kochi', 'Chandigarh', 'Indore', 'Nagpur', 'Surat', 'Bhopal', 'Lucknow',
    'Patna', 'Coimbatore', 'Vadodara', 'Visakhapatnam', 'Nashik',
];

export default function EmployerDashboard() {
    const [city, setCity] = useState('Bangalore');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadData(); }, [city]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/employer/skill-gap?city=${city}`);
            setData(res.data);
        } catch {
            setData(getMockData());
        }
        setLoading(false);
    };

    const getMockData = () => {
        const baseSkills = {
            'Bangalore': [
                { skill: 'Python', demand: 3200, supply: 1100, gap: 2100 },
                { skill: 'SQL', demand: 2800, supply: 900, gap: 1900 },
                { skill: 'Machine Learning', demand: 2100, supply: 380, gap: 1720 },
                { skill: 'React', demand: 1800, supply: 650, gap: 1150 },
                { skill: 'AWS', demand: 1600, supply: 420, gap: 1180 },
                { skill: 'Docker', demand: 1200, supply: 340, gap: 860 },
                { skill: 'Tableau', demand: 900, supply: 200, gap: 700 },
                { skill: 'NLP', demand: 800, supply: 120, gap: 680 },
            ],
            'Mumbai': [
                { skill: 'Python', demand: 2800, supply: 950, gap: 1850 },
                { skill: 'Excel', demand: 2500, supply: 1200, gap: 1300 },
                { skill: 'SQL', demand: 2200, supply: 750, gap: 1450 },
                { skill: 'PowerBI', demand: 1700, supply: 280, gap: 1420 },
                { skill: 'Java', demand: 1500, supply: 500, gap: 1000 },
                { skill: 'SAP', demand: 1100, supply: 300, gap: 800 },
                { skill: 'Salesforce', demand: 900, supply: 200, gap: 700 },
                { skill: 'Cloud', demand: 850, supply: 180, gap: 670 },
            ],
        };

        const defaultSkills = [
            { skill: 'Python', demand: 2300 + Math.floor(Math.random() * 500), supply: 900, gap: 0 },
            { skill: 'SQL', demand: 2000 + Math.floor(Math.random() * 400), supply: 700, gap: 0 },
            { skill: 'Data Analytics', demand: 1800 + Math.floor(Math.random() * 300), supply: 500, gap: 0 },
            { skill: 'Excel', demand: 1500 + Math.floor(Math.random() * 300), supply: 600, gap: 0 },
            { skill: 'Machine Learning', demand: 1200 + Math.floor(Math.random() * 200), supply: 250, gap: 0 },
            { skill: 'Communication', demand: 1800 + Math.floor(Math.random() * 200), supply: 800, gap: 0 },
            { skill: 'PowerBI', demand: 900 + Math.floor(Math.random() * 200), supply: 150, gap: 0 },
            { skill: 'Cloud Computing', demand: 800 + Math.floor(Math.random() * 200), supply: 180, gap: 0 },
        ];

        const skills = (baseSkills[city] || defaultSkills).map(s => ({ ...s, gap: s.gap || s.demand - s.supply }));
        return { city, skills, total_jobs: skills.reduce((a, b) => a + b.demand, 0), total_skills_tracked: skills.length };
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic text-primary-500">Employer Intelligence</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[8px] mt-1">Skill Supply vs Industry Demand Dashboard</p>
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-4 flex-wrap">
                <MapPin className="w-5 h-5 text-primary-500" />
                <div className="flex flex-wrap gap-2">
                    {CITIES.map(c => (
                        <button key={c} onClick={() => setCity(c)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${city === c ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-primary-500 shadow-lg shadow-primary-600/20' : 'text-slate-500 border-white/10 hover:border-primary-500/30 hover:text-primary-400'}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {data && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'City', value: data.city, icon: MapPin },
                            { label: 'Total Jobs', value: data.total_jobs?.toLocaleString(), icon: Building2 },
                            { label: 'Skills Tracked', value: data.total_skills_tracked || data.skills?.length, icon: Users },
                            { label: 'Biggest Gap', value: data.skills?.[0]?.skill || 'N/A', icon: AlertTriangle },
                        ].map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="glass-card p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <stat.icon className="w-4 h-4 text-primary-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                                </div>
                                <p className="text-xl font-black italic tracking-tighter">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-black italic tracking-tighter mb-6">Demand vs Supply — {data.city}</h2>
                        <div className="h-[450px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.skills}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="skill" tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 'bold' }} angle={-20} textAnchor="end" height={70} />
                                    <YAxis tick={{ fill: "var(--chart-text)", fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
                                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                                    <Bar dataKey="demand" name="Job Demand" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="supply" name="Talent Supply" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gap Table */}
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-black italic tracking-tighter mb-6">Shortage Analysis</h2>
                        <div className="space-y-3">
                            {data.skills?.map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                    className="flex items-center justify-between p-4 bg-slate-900/5 dark:bg-black/20 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-primary-500 bg-primary-500/10 w-8 h-8 rounded-lg flex items-center justify-center">#{i + 1}</span>
                                        <span className="font-black text-sm">{item.skill}</span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Demand: <span className="text-primary-400">{item.demand.toLocaleString()}</span></span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Supply: <span className="text-green-400">{item.supply.toLocaleString()}</span></span>
                                        <span className="text-sm font-black italic text-red-400">-{item.gap.toLocaleString()} shortage</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
