import { X, MapPin, TrendingUp, Building2, Briefcase, ShieldAlert, Code2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock drill-down data for roles
const ROLE_DETAILS = {
    'Data Engineer': {
        cities: [
            { name: 'Bangalore', demand: 420 },
            { name: 'Hyderabad', demand: 310 },
            { name: 'Delhi', demand: 280 },
            { name: 'Pune', demand: 190 },
        ],
        companies: [
            { name: 'Google', openings: 85 },
            { name: 'Amazon', openings: 72 },
            { name: 'Microsoft', openings: 58 },
            { name: 'Flipkart', openings: 44 },
        ],
        salary: '₹12L – ₹32L',
        automationRisk: 15,
        skills: ['Python', 'Spark', 'SQL', 'Cloud', 'Kafka', 'Airflow'],
        growth: '+28%',
    },
    'Data Scientist': {
        cities: [
            { name: 'Bangalore', demand: 380 },
            { name: 'Mumbai', demand: 260 },
            { name: 'Hyderabad', demand: 220 },
            { name: 'Delhi', demand: 195 },
        ],
        companies: [
            { name: 'Google', openings: 92 },
            { name: 'TCS', openings: 65 },
            { name: 'Amazon', openings: 58 },
            { name: 'Infosys', openings: 42 },
        ],
        salary: '₹14L – ₹38L',
        automationRisk: 12,
        skills: ['Python', 'ML', 'TensorFlow', 'SQL', 'Statistics', 'NLP'],
        growth: '+32%',
    },
    'AI Engineer': {
        cities: [
            { name: 'Bangalore', demand: 340 },
            { name: 'Hyderabad', demand: 210 },
            { name: 'Pune', demand: 180 },
            { name: 'Chennai', demand: 140 },
        ],
        companies: [
            { name: 'Microsoft', openings: 78 },
            { name: 'Google', openings: 65 },
            { name: 'Amazon', openings: 52 },
            { name: 'Accenture', openings: 38 },
        ],
        salary: '₹16L – ₹45L',
        automationRisk: 8,
        skills: ['Python', 'PyTorch', 'LLMs', 'MLOps', 'Docker', 'Cloud'],
        growth: '+42%',
    },
    'Cloud Architect': {
        cities: [
            { name: 'Bangalore', demand: 290 },
            { name: 'Mumbai', demand: 220 },
            { name: 'Delhi', demand: 180 },
            { name: 'Hyderabad', demand: 160 },
        ],
        companies: [
            { name: 'Amazon', openings: 95 },
            { name: 'Microsoft', openings: 82 },
            { name: 'Google', openings: 60 },
            { name: 'TCS', openings: 48 },
        ],
        salary: '₹18L – ₹50L',
        automationRisk: 10,
        skills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'DevOps'],
        growth: '+35%',
    },
    'AI Ethics Specialist': {
        cities: [
            { name: 'Delhi', demand: 120 },
            { name: 'Bangalore', demand: 95 },
            { name: 'Mumbai', demand: 80 },
            { name: 'Pune', demand: 55 },
        ],
        companies: [
            { name: 'Google', openings: 35 },
            { name: 'Microsoft', openings: 28 },
            { name: 'Accenture', openings: 22 },
            { name: 'TCS', openings: 18 },
        ],
        salary: '₹10L – ₹28L',
        automationRisk: 5,
        skills: ['AI Policy', 'Fairness', 'Governance', 'Legal', 'Ethics', 'NLP'],
        growth: '+55%',
    },
    'Software Engineer': {
        cities: [
            { name: 'Bangalore', demand: 520 },
            { name: 'Hyderabad', demand: 380 },
            { name: 'Pune', demand: 320 },
            { name: 'Delhi', demand: 290 },
        ],
        companies: [
            { name: 'Google', openings: 120 },
            { name: 'Amazon', openings: 98 },
            { name: 'Microsoft', openings: 85 },
            { name: 'TCS', openings: 140 },
        ],
        salary: '₹8L – ₹35L',
        automationRisk: 22,
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Docker'],
        growth: '+18%',
    },
};

const MiniTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-white/10 backdrop-blur-xl rounded-xl p-3 shadow-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black text-white">{payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function DrillDownPanel({ item, type, onClose }) {
    if (!item) return null;

    // Try to find detailed data for the item
    const details = ROLE_DETAILS[item] || ROLE_DETAILS['Software Engineer'];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0d1a]/95 border border-white/10 rounded-3xl shadow-[(/)] p-10">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-900/5 border border-white/10 rounded-xl hover:bg-slate-900/10 transition-all"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                            {type === 'company' ? 'Company Analysis' : 'Role Analysis'}
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">{item}</h2>
                    <div className="flex items-center gap-4 mt-4">
                        <span className="px-4 py-1.5 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                            Growth: {details.growth}
                        </span>
                        <span className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                            AI Risk: {details.automationRisk}%
                        </span>
                        <span className="px-4 py-1.5 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">
                            Salary: {details.salary}
                        </span>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* City Distribution */}
                    <div className="bg-slate-900/[0.03] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">City Demand Distribution</h3>
                        </div>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={details.cities} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<MiniTooltip />} />
                                    <Bar dataKey="demand" fill="url(#cityGrad)" radius={[4, 4, 0, 0]} barSize={28} />
                                    <defs>
                                        <linearGradient id="cityGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4cc9f0" />
                                            <stop offset="100%" stopColor="#4361ee" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Company Distribution */}
                    <div className="bg-slate-900/[0.03] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Building2 className="w-4 h-4 text-purple-400" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Company Demand Distribution</h3>
                        </div>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={details.companies} layout="vertical" margin={{ top: 5, right: 5, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} width={70} />
                                    <Tooltip content={<MiniTooltip />} />
                                    <Bar dataKey="openings" fill="url(#compGrad)" radius={[0, 4, 4, 0]} barSize={20} />
                                    <defs>
                                        <linearGradient id="compGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#7b2cbf" />
                                            <stop offset="100%" stopColor="#f72585" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Skills Required */}
                <div className="bg-slate-900/[0.03] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Code2 className="w-4 h-4 text-green-400" />
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Skills Required</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {details.skills.map((skill) => (
                            <span
                                key={skill}
                                className="px-5 py-2.5 bg-slate-900/5 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-wider hover:bg-purple-500/10 hover:border-purple-500/20 transition-all cursor-default"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Top Cities & Companies Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Top Cities Hiring
                        </h4>
                        {details.cities.map((c, i) => (
                            <div key={c.name} className="flex items-center justify-between p-3 bg-slate-900/[0.02] rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-slate-600 w-4">{i + 1}.</span>
                                    <span className="text-xs font-black text-white uppercase">{c.name}</span>
                                </div>
                                <span className="text-xs font-black text-cyan-400">{c.demand} openings</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="w-3 h-3" /> Top Companies Hiring
                        </h4>
                        {details.companies.map((c, i) => (
                            <div key={c.name} className="flex items-center justify-between p-3 bg-slate-900/[0.02] rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-slate-600 w-4">{i + 1}.</span>
                                    <span className="text-xs font-black text-white uppercase">{c.name}</span>
                                </div>
                                <span className="text-xs font-black text-purple-400">{c.openings} openings</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
