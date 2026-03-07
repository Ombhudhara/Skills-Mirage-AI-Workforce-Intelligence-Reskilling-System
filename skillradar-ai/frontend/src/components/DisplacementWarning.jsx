import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, TrendingDown, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DisplacementWarning() {
    const [data, setData] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/displacement/watchlist');
            setData(res.data);
        } catch {
            setData(getMock());
        }
    };

    const getMock = () => ({
        watchlist: [
            { role: 'BPO Voice', decline: -42, severity: 'critical', previous_count: 850, current_count: 493 },
            { role: 'Data Entry Operator', decline: -36, severity: 'critical', previous_count: 620, current_count: 397 },
            { role: 'Telemarketing', decline: -32, severity: 'high', previous_count: 380, current_count: 258 },
            { role: 'Customer Support (L1)', decline: -28, severity: 'warning', previous_count: 1200, current_count: 864 },
            { role: 'Manual Testing', decline: -27, severity: 'warning', previous_count: 540, current_count: 394 },
            { role: 'Accounts Clerk', decline: -26, severity: 'warning', previous_count: 310, current_count: 229 },
        ],
        alert_count: 6,
        threshold: -25,
    });

    const getSeverityStyle = (sev) => {
        if (sev === 'critical') return 'border-red-500 bg-red-500/10 text-red-400';
        if (sev === 'high') return 'border-orange-500 bg-orange-500/10 text-orange-400';
        return 'border-amber-500 bg-amber-500/10 text-amber-400';
    };

    if (!data) return null;

    return (
        <div className="glass-card p-8 border-l-4 border-red-500 bg-red-500/5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter">Displacement Early Warning</h2>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Roles with &gt;25% hiring decline detected</p>
                    </div>
                </div>
                <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-4 py-2 rounded-full uppercase tracking-widest">
                    {data.alert_count} Alerts Active
                </span>
            </div>

            <div className="space-y-3">
                {data.watchlist.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-xl border ${getSeverityStyle(item.severity)}`}>
                        <div className="flex items-center gap-4">
                            <TrendingDown className="w-5 h-5" />
                            <div>
                                <p className="font-black text-sm">{item.role}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{item.severity.toUpperCase()} RISK</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Jobs: {item.previous_count} → {item.current_count}</p>
                            </div>
                            <span className="text-2xl font-black italic">{item.decline}%</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
