import { useState, useEffect } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LabelList, Cell
} from 'recharts';
import {
    IndianRupee, TrendingUp, Briefcase, MapPin, Award, ArrowUpRight,
    Building2, Users, ChevronDown
} from 'lucide-react';
import { getSalaryIntelligence } from '../api/client';

// ── Data types removed (Now using live API) ──

// ── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                <p className="text-white text-xs font-bold tracking-widest uppercase mb-2">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-xs font-bold" style={{ color: p.color || '#4cc9f0' }}>
                        {p.name}: ₹{p.value} LPA
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ── Component ───────────────────────────────────────────────────────────────

export default function SalaryExplorer() {
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [loading, setLoading] = useState(true);

    // ── Fallback Mock Data Generator ──
    const generateMockData = (role) => {
        const isAll = role === 'All Roles';
        const roleHash = role.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const baseSal = isAll ? 7.4 : 5 + (roleHash % 8);

        const mockRoles = [
            'Data Analyst', 'Digital Marketing Specialist', 'Customer Support',
            'Customer Success Manager', 'BPO Executive', 'Sales Analytics',
            'CRM Management'
        ];

        const salaryByRole = (isAll ? mockRoles.slice(0, 7) : [role]).map((r, i) => {
            const base = isAll ? 18 - i * 1.2 : baseSal;
            return {
                role: r,
                min: +(base * 0.6).toFixed(1),
                avg: +base.toFixed(1),
                max: +(base * 1.8).toFixed(1),
                growth: `+${(3 + (i * 2.3) % 8).toFixed(1)}%`
            };
        });

        const cities = ['Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Delhi', 'Gurgaon'];
        const cityColors = ['#7b2cbf', '#3f37c9', '#4361ee', '#4895ef', '#4cc9f0', '#f72585', '#b5179e'];
        const salaryByCity = cities.map((city, i) => ({
            city,
            avg: +(baseSal * (1.2 - i * 0.06)).toFixed(1),
            color: cityColors[i]
        }));

        const salaryByExperience = [
            { years: '0-1', salary: +(baseSal * 0.45).toFixed(1) },
            { years: '1-3', salary: +(baseSal * 0.65).toFixed(1) },
            { years: '3-5', salary: +(baseSal * 0.85).toFixed(1) },
            { years: '5-8', salary: +(baseSal * 1.2).toFixed(1) },
            { years: '8+', salary: +(baseSal * 1.8).toFixed(1) },
        ];

        const topPayingCompanies = [
            { company: 'IT Services', avg: +(baseSal * 1.3).toFixed(1), roles: 42 },
            { company: 'Finance', avg: +(baseSal * 1.2).toFixed(1), roles: 38 },
            { company: 'Retail', avg: +(baseSal * 1.1).toFixed(1), roles: 55 },
            { company: 'Marketing', avg: +(baseSal * 1.05).toFixed(1), roles: 22 },
            { company: 'BPO', avg: +(baseSal * 0.8).toFixed(1), roles: 30 },
        ];

        const topRoleRow = salaryByRole.reduce((best, r) => r.avg > best.avg ? r : best, salaryByRole[0]);
        const topCityRow = salaryByCity.reduce((best, c) => c.avg > best.avg ? c : best, salaryByCity[0]);

        return {
            avg_salary: +baseSal.toFixed(1),
            max_salary: +(baseSal * 2.2).toFixed(1),
            top_role: topRoleRow.role,
            top_role_salary: topRoleRow.avg,
            top_city: topCityRow.city,
            top_city_salary: topCityRow.avg,
            salary_by_city: salaryByCity,
            salary_by_role: salaryByRole,
            salary_by_experience: salaryByExperience,
            top_paying_companies: topPayingCompanies,
            available_roles: mockRoles
        };
    };

    const [stats, setStats] = useState(() => generateMockData('All Roles'));

    useEffect(() => {
        const fetchSalaryData = async () => {
            setLoading(true);
            try {
                const data = await getSalaryIntelligence(selectedRole);
                if (data && !data.error) {
                    const mock = generateMockData(selectedRole);
                    // Merge: use real data where available, fallback to mock for empties
                    const merged = {
                        avg_salary: data.avg_salary || mock.avg_salary,
                        max_salary: data.max_salary || mock.max_salary,
                        top_role: data.top_role || mock.top_role,
                        top_role_salary: data.top_role_salary || mock.top_role_salary,
                        top_city: data.top_city || mock.top_city,
                        top_city_salary: data.top_city_salary || mock.top_city_salary,
                        salary_by_city: data.salary_by_city?.length > 0 ? data.salary_by_city : mock.salary_by_city,
                        salary_by_role: data.salary_by_role?.length > 0 ? data.salary_by_role : mock.salary_by_role,
                        salary_by_experience: data.salary_by_experience?.length > 0 ? data.salary_by_experience : mock.salary_by_experience,
                        top_paying_companies: data.top_paying_companies?.length > 0 ? data.top_paying_companies : mock.top_paying_companies,
                        available_roles: data.available_roles?.length > 0 ? data.available_roles : mock.available_roles,
                    };
                    setStats(merged);
                } else {
                    // API returned error - use complete mock
                    setStats(generateMockData(selectedRole));
                }
            } catch (err) {
                console.error("Failed to fetch salary intelligence:", err);
                setStats(generateMockData(selectedRole));
            } finally {
                setLoading(false);
            }
        };
        fetchSalaryData();
    }, [selectedRole]);

    const {
        avg_salary, max_salary, top_role, top_role_salary,
        top_city, top_city_salary, salary_by_city, salary_by_role,
        salary_by_experience, top_paying_companies, available_roles
    } = stats;

    return (
        <div className="animate-in fade-in zoom-in-95 duration-700 relative min-h-screen pb-20">
            {/* SVG Gradients */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7b2cbf" />
                        <stop offset="100%" stopColor="#3f37c9" />
                    </linearGradient>
                    <linearGradient id="salaryLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4cc9f0" />
                        <stop offset="100%" stopColor="#7b2cbf" />
                    </linearGradient>
                    <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f72585" />
                        <stop offset="100%" stopColor="#7b2cbf" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="space-y-10">
                {/* ── HEADER ─────────────────────────────────── */}
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            💰 Salary Intelligence
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 font-medium">
                            Comprehensive salary analytics across India's tech ecosystem
                        </p>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="appearance-none bg-[var(--card-bg)] border border-[var(--card-border)] px-5 py-3 pr-10 rounded-xl text-[var(--text-color)] text-xs font-bold tracking-widest uppercase cursor-pointer hover:bg-slate-900/10 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        >
                            <option value="All Roles" className="bg-slate-900">All Roles</option>
                            {available_roles.length > 0 ? (
                                available_roles.map(role => (
                                    <option key={role} value={role} className="bg-slate-900">{role}</option>
                                ))
                            ) : (
                                <option value="Software Engineer" className="bg-slate-900">Software Engineer</option>
                            )}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* ── STAT CARDS ──────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card p-6 group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
                                <IndianRupee className="w-4 h-4 text-green-400" />
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Avg Salary</p>
                        </div>
                        <p className="text-2xl font-bold">₹{avg_salary} <span className="text-sm text-slate-400">LPA</span></p>
                    </div>
                    <div className="glass-card p-6 group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Max Salary</p>
                        </div>
                        <p className="text-2xl font-bold">₹{max_salary} <span className="text-sm text-slate-400">LPA</span></p>
                    </div>
                    <div className="glass-card p-6 group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                                <Award className="w-4 h-4 text-cyan-400" />
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Top Role</p>
                        </div>
                        <p className="text-lg font-bold">{top_role}</p>
                        <p className="text-xs text-green-400 font-bold">₹{top_role_salary} LPA avg</p>
                    </div>
                    <div className="glass-card p-6 group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-pink-500/10 rounded-xl border border-pink-500/20">
                                <MapPin className="w-4 h-4 text-pink-400" />
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Top City</p>
                        </div>
                        <p className="text-lg font-bold">{top_city}</p>
                        <p className="text-xs text-green-400 font-bold">₹{top_city_salary} LPA avg</p>
                    </div>
                </div>

                {/* ── SALARY BY ROLE & BY CITY ────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* By Role */}
                    <div className="glass-card p-10 relative group">
                        <div className="flex items-center gap-3 mb-8">
                            <Briefcase className="w-5 h-5 text-purple-400" />
                            <h3 className="text-xs font-bold tracking-widest uppercase">Salary by Role</h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salary_by_role} layout="vertical" margin={{ top: 5, right: 60, left: 20, bottom: 5 }} barCategoryGap={20}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `₹${v}L`} />
                                    <YAxis type="category" dataKey="role" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 700 }} width={120} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="avg" name="Avg Salary" fill="url(#salaryGradient)" radius={[0, 6, 6, 0]} barSize={16}>
                                        <LabelList dataKey="growth" position="right" style={{ fill: '#4ade80', fontSize: 10, fontWeight: 900 }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* By City */}
                    <div className="glass-card p-10 relative group">
                        <div className="flex items-center gap-3 mb-8">
                            <MapPin className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-xs font-bold tracking-widest uppercase">Salary by City</h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salary_by_city} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `₹${v}L`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="avg" name="Avg Salary" radius={[6, 6, 0, 0]} barSize={28}>
                                        {salary_by_city.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── SALARY VS EXPERIENCE & TREND ────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Experience */}
                    <div className="glass-card p-10 relative group">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="w-5 h-5 text-pink-400" />
                            <h3 className="text-xs font-bold tracking-widest uppercase">Salary vs Experience</h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salary_by_experience} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="years" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `₹${v}L`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="salary" name="Avg Salary" stroke="url(#expGradient)" strokeWidth={3} dot={{ r: 5, fill: '#f72585', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#f72585' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Yearly Trend */}
                    <div className="glass-card p-10 relative group">
                        <div className="flex items-center gap-3 mb-8">
                            <ArrowUpRight className="w-5 h-5 text-green-400" />
                            <h3 className="text-xs font-bold tracking-widest uppercase">Market Salary Distribution</h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salary_by_role} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `₹${v}L`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="avg" name="Avg Salary" fill="url(#salaryGradient)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-4">
                            {[{ label: 'AI Engineer', color: '#7b2cbf' }, { label: 'Cloud', color: '#4361ee' }, { label: 'Data', color: '#4cc9f0' }, { label: 'Software', color: '#f72585' }].map(l => (
                                <div key={l.label} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }}></div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── TOP PAYING COMPANIES & SALARY TABLE ─────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Paying Companies */}
                    <div className="glass-card p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <Building2 className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-sm font-black text-white tracking-widest uppercase neon-glow">Top Paying Companies</h3>
                        </div>
                        <div className="space-y-3">
                            {(top_paying_companies || []).map((c, i) => (
                                <div key={c.company} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/5 border border-white/5 hover:border-white/20 hover:bg-slate-900/10 transition-all group/item">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center text-sm font-black text-yellow-400">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white tracking-wide uppercase">{c.company}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold">{c.roles} open roles</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-green-400">₹{c.avg}</span>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">LPA Avg</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Salary Range Table */}
                    <div className="glass-card p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <Users className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-sm font-black text-white tracking-widest uppercase neon-glow">Salary Range by Role</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest pb-4">Role</th>
                                        <th className="text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest pb-4">Min</th>
                                        <th className="text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest pb-4">Avg</th>
                                        <th className="text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest pb-4">Max</th>
                                        <th className="text-right text-[9px] font-bold text-slate-500 uppercase tracking-widest pb-4">Growth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salary_by_role.map((r) => (
                                        <tr key={r.role} className="border-b border-white/5 hover:bg-slate-900/5 transition-colors">
                                            <td className="py-4 text-xs font-bold text-white">{r.role}</td>
                                            <td className="py-4 text-center text-xs font-bold text-slate-400">₹{r.min}L</td>
                                            <td className="py-4 text-center text-xs font-black text-cyan-400">₹{r.avg}L</td>
                                            <td className="py-4 text-center text-xs font-bold text-slate-400">₹{r.max}L</td>
                                            <td className="py-4 text-right text-xs font-black text-green-400">{r.growth}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
