import { useState, useRef, useEffect } from 'react';
import { evaluateWorkerProfile } from '../api/client';
import {
    ShieldAlert, Code2, Activity, UserCircle, BookOpen, Clock,
    GraduationCap, ExternalLink, Send, Bot, User, Sparkles, BarChart3, TrendingUp, IndianRupee
} from 'lucide-react';

// ── Mock data ───────────────────────────────────────────────────────────────

const reskillingPath = [
    { week: 1, skill: 'Excel Automation', time: '4 hrs', difficulty: 'Beginner', description: 'Master macros, pivot tables & VBA basics' },
    { week: 2, skill: 'Intro to Python', time: '5 hrs', difficulty: 'Beginner', description: 'Variables, loops, functions & file handling' },
    { week: 3, skill: 'Data Analysis with Pandas', time: '6 hrs', difficulty: 'Intermediate', description: 'DataFrames, cleaning, merging & aggregation' },
    { week: 4, skill: 'AI Tools for Productivity', time: '4 hrs', difficulty: 'Beginner', description: 'ChatGPT, Copilot, automation workflows' },
];

// Salary data by role (min/avg/max in LPA)
const SALARY_DATA = {
    'data engineer': { min: 6, avg: 14, max: 28 },
    'data scientist': { min: 8, avg: 16, max: 35 },
    'ai engineer': { min: 10, avg: 18, max: 40 },
    'cloud architect': { min: 12, avg: 22, max: 45 },
    'software engineer': { min: 4, avg: 10, max: 24 },
    'business analyst': { min: 5, avg: 9, max: 18 },
    'data analyst': { min: 4, avg: 8, max: 16 },
    'data entry clerk': { min: 2, avg: 3.5, max: 6 },
    'customer service rep': { min: 2, avg: 4, max: 8 },
    'accountant': { min: 3, avg: 7, max: 14 },
    'ai ethics specialist': { min: 7, avg: 12, max: 25 },
};

// City salary multipliers
const CITY_MULTIPLIER = {
    'bangalore': 1.15, 'mumbai': 1.10, 'delhi': 1.05, 'gurgaon': 1.10,
    'hyderabad': 1.0, 'pune': 0.95, 'chennai': 0.95,
};

function estimateSalary(jobTitle, experience, city) {
    const key = (jobTitle || '').toLowerCase();
    const base = SALARY_DATA[key] || { min: 3, avg: 6, max: 15 };
    const expFactor = 1 + Math.min(experience || 0, 15) * 0.06;
    const cityFactor = CITY_MULTIPLIER[(city || '').toLowerCase()] || 1.0;
    return {
        min: Math.round(base.min * expFactor * cityFactor * 10) / 10,
        avg: Math.round(base.avg * expFactor * cityFactor * 10) / 10,
        max: Math.round(base.max * expFactor * cityFactor * 10) / 10,
    };
}

const freeCourses = [
    { name: 'Python for Data Science', platform: 'SWAYAM', level: 'Beginner', color: 'bg-primary-500', url: '#' },
    { name: 'Excel Automation', platform: 'NPTEL', level: 'Beginner', color: 'bg-green-500', url: '#' },
    { name: 'AI Fundamentals', platform: 'Coursera', level: 'Intermediate', color: 'bg-purple-500', url: '#' },
    { name: 'Cloud Computing Basics', platform: 'edX', level: 'Beginner', color: 'bg-secondary-500', url: '#' },
];

const quickSuggestions = [
    'How can I reduce automation risk?',
    'Which skills should I learn next?',
    'Show courses for my role.',
];

function getDifficultyBadge(d) {
    if (d === 'Beginner') return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    if (d === 'Intermediate') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
}

function getPlatformColor(p) {
    if (p === 'SWAYAM') return 'bg-primary-500/10 text-primary-400 border border-primary-500/20';
    if (p === 'NPTEL') return 'bg-green-500/10 text-green-400 border border-green-500/20';
    if (p === 'Coursera') return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    return 'bg-secondary-500/10 text-secondary-400 border border-secondary-500/20';
}

// ── Component ───────────────────────────────────────────────────────────────

export default function WorkerIntelligence() {
    const [formData, setFormData] = useState({
        job_title: '',
        city: '',
        experience_years: '',
        write_up: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Chat state
    const [chatMessages, setChatMessages] = useState([
        { id: 1, type: 'ai', content: 'Connection Established. I am your AI Career Strategist. Query me for skill acquisition paths or risk mitigation.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatLang, setChatLang] = useState('en');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                experience_years: parseFloat(formData.experience_years) || 0
            };
            const res = await evaluateWorkerProfile(payload);
            // Clamp risk_score to 0-100 range
            if (res && res.risk_score !== undefined) {
                res.risk_score = Math.round(Math.max(0, Math.min(100, Number(res.risk_score) || 0)));
            }
            setResult(res);
            // Save for chatbot context
            localStorage.setItem('user_profile', JSON.stringify(payload));
        } catch {
            const roleKey = (formData.job_title || '').toLowerCase();
            const lowRisk = ['ai', 'scientist', 'architect', 'lead', 'manager'].some(k => roleKey.includes(k));
            const highRisk = ['clerk', 'entry', 'bpo', 'support', 'accounting'].some(k => roleKey.includes(k));

            const baseScore = highRisk ? 85 : lowRisk ? 25 : 55;
            const cityPrice = CITY_MULTIPLIER[(formData.city || '').toLowerCase()] || 1.0;
            const finalScore = Math.round(Math.max(5, Math.min(95, baseScore + (Math.random() * 10 - 5))));

            setResult({
                extracted_skills: roleKey.includes('data') ? ['Python', 'SQL', 'Tableau'] : ['Communication', 'Office 365', 'Planning'],
                risk_score: finalScore,
                risk_category: finalScore > 70 ? 'High Attrition Vector' : finalScore > 40 ? 'Augmentation Required' : 'Strategic Asset',
                primary_factor: `Automation susceptibility for ${formData.job_title || 'this role'} in ${formData.city || 'current region'}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChatSend = async (msg) => {
        const text = msg || chatInput.trim();
        if (!text) return;
        setChatInput('');
        setChatMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text }]);
        setChatLoading(true);

        try {
            // Get profile for context
            const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');

            // Import the client function
            const { sendChatMessage } = await import('../api/client');

            const res = await sendChatMessage({
                message: text,
                job_title: profile.job_title || formData.job_title,
                city: profile.city || formData.city,
                experience: parseFloat(profile.experience_years) || parseFloat(formData.experience_years) || 0,
                language: chatLang === 'hi' ? 'Hindi' : 'English'
            });

            setChatMessages(prev => [...prev, { id: Date.now(), type: 'ai', content: res.reply }]);
        } catch (err) {
            console.error("Worker Intelligence Chat Error:", err);
            // Don't show predefined fallback based on keywords. Show the actual network error 
            // so the user knows if the AI Engine / chatbot.py is down or missing API keys.
            let reply = chatLang === 'hi'
                ? `कनेक्शन त्रुटि: ${err.message}. कृपया सुनिश्चित करें कि AI सर्वर (chatbot.py) चल रहा है।`
                : `Connection Error: ${err.message}. The AI Strategist (chatbot.py) may be offline or misconfigured.`;
            setChatMessages(prev => [...prev, { id: Date.now(), type: 'ai', content: reply }]);
        } finally {
            setChatLoading(false);
        }
    };

    const getRiskColorClass = (score) => {
        if (score > 60) return 'text-red-400 neon-glow';
        if (score > 30) return 'text-yellow-400 neon-glow';
        return 'text-green-400 neon-glow';
    };

    const getRiskBgClass = (score) => {
        if (score > 60) return 'bg-red-500/5 border-red-500/20 shadow-[(/)]';
        if (score > 30) return 'bg-yellow-500/5 border-yellow-500/20 shadow-[(/)]';
        return 'bg-green-500/5 border-green-500/20 shadow-[(/)]';
    };

    const getRiskExplanation = (score) => {
        if (score > 60) return 'CRITICAL ATTRITION RISK DETECTED: High density of routinized protocols.';
        if (score > 30) return 'MODERATE VULNERABILITY: Augmented intelligence interface recommended.';
        return 'LOW RISK VECTOR: High heuristic complexity and decision-making depth.';
    };

    const getRiskStroke = (score) => {
        if (score > 60) return '#f72585';
        if (score > 30) return '#ffb703';
        return '#06d6a0';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col lg:flex-row gap-12">

                {/* ── Left: Input Form ──────────────────────── */}
                <div className="w-full lg:w-5/12 space-y-8">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter neon-glow">
                            COGNITIVE AUDIT
                        </h2>
                        <p className="text-slate-400 mt-2 font-medium tracking-wide uppercase text-[10px]">AI workforce vulnerability & reskilling analysis</p>
                    </div>

                    <form onSubmit={handleSubmit} className="glass-card p-10 space-y-6 relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 blur-[100px] rounded-full group-hover:from-purple-500 hover:to-blue-500/20 transition-all duration-700"></div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Current Job Title</label>
                            <input
                                required
                                list="job-roles"
                                className="w-full bg-slate-900/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-primary-500/50 focus:shadow-[(/)] transition-all placeholder:text-slate-600"
                                placeholder="e.g. Data Entry Clerk"
                                value={formData.job_title}
                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                            />
                            <datalist id="job-roles">
                                <option value="Data Analyst" />
                                <option value="Data Scientist" />
                                <option value="Software Engineer" />
                                <option value="Data Entry Clerk" />
                                <option value="Customer Service Rep" />
                                <option value="Accountant" />
                            </datalist>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Region</label>
                                <input
                                    required
                                    className="w-full bg-slate-900/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="e.g. Mumbai"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Tenure (Years)</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    className="w-full bg-slate-900/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="0"
                                    value={formData.experience_years}
                                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Core Operational Tasks</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full bg-slate-900/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-600 resize-none"
                                placeholder="Describe your daily operations..."
                                value={formData.write_up}
                                onChange={(e) => setFormData({ ...formData, write_up: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-[(/)] hover:shadow-[(/)] active:scale-95 uppercase tracking-widest text-[10px]"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Initiate Intelligence Scan
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* ── Right: Results Panel ─────────────────────── */}
                <div className="w-full lg:w-7/12">
                    {result ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {/* ═══ SECTION 1 – Personal AI Risk Score ═══ */}
                            <div className={`p-10 rounded-3xl border ${getRiskBgClass(result.risk_score)} flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-xl`}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                                <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary-400" /> ATTRITION VECTOR PROBABILITY
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
                                    <div className="w-56 h-56 relative mx-auto group">
                                        <div className="absolute inset-0 bg-slate-900/5 rounded-full blur-2xl group-hover:bg-slate-900/10 transition-all duration-700"></div>
                                        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                            <circle
                                                cx="50" cy="50" r="45"
                                                fill="none"
                                                stroke={getRiskStroke(result.risk_score)}
                                                strokeWidth="6"
                                                strokeLinecap="round"
                                                strokeDasharray={`${Math.max(0, Math.min(100, result.risk_score)) * 2.827} 283`}
                                                className="transition-all duration-1000 ease-out shadow-[0_0_15px_currentColor]"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                            <span className={`text-6xl font-black ${getRiskColorClass(result.risk_score)}`}>{Math.round(Math.max(0, Math.min(100, result.risk_score)))}</span>
                                            <span className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em] mt-1">INDEX VALUE</span>
                                        </div>
                                    </div>

                                    {/* Peer Comparison Card */}
                                    {result.peer_comparison && (
                                        <div className="glass-card p-6 bg-slate-900/5 border border-white/10 text-left">
                                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-4">Peer Benchmark</p>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase">Avg Role Risk</p>
                                                    <p className="text-xl font-black text-white">{result.peer_comparison.avg_peer_risk}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase">Your Percentile</p>
                                                    <p className={`text-xl font-black ${result.peer_comparison.status === 'higher_than_peers' ? 'text-red-400' : 'text-green-400'}`}>
                                                        Top {result.peer_comparison.percentile}%
                                                    </p>
                                                </div>
                                                <div className="pt-2 border-t border-white/10">
                                                    <p className="text-[10px] font-black uppercase text-slate-500">
                                                        Status: <span className={result.peer_comparison.status === 'higher_than_peers' ? 'text-red-400' : 'text-green-400'}>
                                                            {result.peer_comparison.status.replace(/_/g, ' ').toUpperCase()}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 space-y-2">
                                    <h4 className={`text-2xl font-black uppercase tracking-tight ${getRiskColorClass(result.risk_score)}`}>{result.risk_category}</h4>
                                    <p className="text-xs font-bold text-slate-400 max-w-sm leading-relaxed tracking-wide">
                                        {getRiskExplanation(result.risk_score)}
                                    </p>
                                </div>

                                {/* Feature 11: Extra metrics in Risk Card */}
                                <div className="grid grid-cols-2 gap-8 w-full mt-10 pt-8 border-t border-white/10">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Hiring Decline</p>
                                        <p className="text-lg font-black text-slate-300">{(result.risk_score * 0.4).toFixed(1)}%</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Replacement Ratio</p>
                                        <p className="text-lg font-black text-slate-300">{(result.risk_score / 100).toFixed(2)}:1</p>
                                    </div>
                                </div>
                            </div>

                            {/* ═══ SALARY ESTIMATE ═══ */}
                            {(() => {
                                const sal = estimateSalary(formData.job_title, parseFloat(formData.experience_years), formData.city);
                                return (
                                    <div className="glass-card p-8">
                                        <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-yellow-400" /> Salary Intelligence
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-slate-900/5 rounded-2xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Min</p>
                                                <p className="text-xl font-black text-slate-300">₹{sal.min}L</p>
                                            </div>
                                            <div className="text-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                                                <p className="text-[9px] font-bold text-green-400 uppercase tracking-widest mb-1">Estimated</p>
                                                <p className="text-2xl font-black text-green-400">₹{sal.avg}L</p>
                                            </div>
                                            <div className="text-center p-4 bg-slate-900/5 rounded-2xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Max</p>
                                                <p className="text-xl font-black text-slate-300">₹{sal.max}L</p>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-bold mt-4 text-center tracking-wider uppercase">Based on {formData.job_title || 'role'} • {formData.experience_years || 0} yrs • {formData.city || 'India'}</p>
                                    </div>
                                );
                            })()}

                            {/* Extracted Skills */}
                            <div className="glass-card p-10">
                                <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                                    <Code2 className="w-4 h-4 text-primary-400" /> OPERATIONAL COMPETENCIES
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {result.extracted_skills.map((skill, idx) => (
                                        <span key={idx} className="bg-slate-900/5 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-900/10 transition-all">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* ═══ SECTION 2 – Week-by-Week Reskilling Path ═══ */}
                            <div className="glass-card p-10">
                                <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-cyan-400" /> SEQUENCE PROTOCOL
                                </h3>
                                <div className="relative ml-4">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-900/10"></div>
                                    <div className="space-y-8">
                                        {reskillingPath.map((step, idx) => (
                                            <div key={idx} className="relative pl-10">
                                                <div className="absolute left-[-5px] top-1.5 w-[11px] h-[11px] rounded-full bg-cyan-500 shadow-[(/)]"></div>
                                                <div className="bg-slate-900/5 border border-white/5 rounded-2xl p-6 hover:bg-slate-900/10 transition-all group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-black text-white uppercase tracking-wider">Phase {step.week}: {step.skill}</h4>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getDifficultyBadge(step.difficulty)}`}>
                                                            {step.difficulty}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] text-slate-400 font-medium mb-4 leading-relaxed">{step.description}</p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-slate-500 flex items-center gap-1.5 uppercase">
                                                            <Clock className="w-3 h-3" /> {step.time}
                                                        </span>
                                                        <span className="text-[10px] font-black text-cyan-400/80 flex items-center gap-1.5 uppercase tracking-tighter">
                                                            Module Verified
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ═══ SECTION 3 – Free Learning Resources ═══ */}
                            <div className="glass-card p-10">
                                <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary-400" /> KNOWLEDGE REPOSITORY
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {freeCourses.map((course, idx) => (
                                        <div key={idx} className="bg-slate-900/5 border border-white/10 rounded-2xl p-6 hover:bg-slate-900/10 transition-all group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-12 h-12 bg-slate-900/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary-500/50 transition-all`}>
                                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${course.color} bg-opacity-10 text-white`}>
                                                        <GraduationCap className="w-6 h-6" />
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getPlatformColor(course.platform)}`}>
                                                    {course.platform}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{course.name}</h4>
                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-5">Access Level: {course.level}</p>
                                            <a href={course.url} className="inline-flex items-center gap-2 text-[10px] font-black text-primary-400 hover:text-primary-300 uppercase tracking-widest group-hover:gap-3 transition-all">
                                                Initialize Access <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ═══ SECTION 4 – AI Career Chatbot ═══ */}
                            <div className="glass-card overflow-hidden flex flex-col h-[500px]">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
                                        <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">STRATEGIST_CORE</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setChatLang('en')} className={`text-[9px] px-3 py-1 rounded-lg font-black transition-all ${chatLang === 'en' ? 'bg-primary-500 text-white shadow-[(/)]' : 'bg-slate-900/5 text-slate-500 border border-white/10'}`}>EN</button>
                                        <button onClick={() => setChatLang('hi')} className={`text-[9px] px-3 py-1 rounded-lg font-black transition-all ${chatLang === 'hi' ? 'bg-primary-500 text-white shadow-[(/)]' : 'bg-slate-900/5 text-slate-500 border border-white/10'}`}>HI</button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex gap-4 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${msg.type === 'user' ? 'border-primary-500/30 bg-primary-500/10 text-primary-400' : 'border-white/10 bg-slate-900/5 text-slate-400'}`}>
                                                    {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                                </div>
                                                <div className={`p-4 rounded-2xl text-[13px] font-medium leading-relaxed tracking-tight ${msg.type === 'user' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none shadow-lg' : 'bg-slate-900/5 text-slate-200 rounded-tl-none border border-white/5'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-4 max-w-[85%]">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 bg-slate-900/5 text-slate-400">
                                                    <Bot className="w-4 h-4" />
                                                </div>
                                                <div className="p-4 rounded-2xl bg-slate-900/5 border border-white/5 rounded-tl-none flex gap-1.5 items-center">
                                                    <div className="w-1 h-1 bg-slate-9500 rounded-full animate-bounce"></div>
                                                    <div className="w-1 h-1 bg-slate-9500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                                    <div className="w-1 h-1 bg-slate-9500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-6 bg-slate-900/5 border-t border-white/10">
                                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                                        {quickSuggestions.map((s, i) => (
                                            <button key={i} onClick={() => handleChatSend(s)} className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-slate-900/5 border border-white/10 text-slate-400 px-4 py-2 rounded-xl hover:bg-slate-900/10 transition-all whitespace-nowrap">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <form onSubmit={(e) => { e.preventDefault(); handleChatSend(); }} className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder={chatLang === 'hi' ? 'प्रश्न पूछें...' : 'Initiate query...'}
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            className="flex-1 bg-slate-900/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-600"
                                        />
                                        <button type="submit" disabled={!chatInput.trim() || chatLoading} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 rounded-2xl hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-primary-900/40">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full glass-card border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 p-12 text-center min-h-[500px] relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 blur-[120px] rounded-full"></div>
                            <UserCircle className="w-20 h-20 mb-6 opacity-20 relative z-10" />
                            <p className="text-xl font-black text-white/40 uppercase tracking-widest relative z-10">Awaiting Profile Input</p>
                            <p className="text-xs font-bold mt-4 max-w-sm leading-relaxed text-slate-600 relative z-10 uppercase tracking-wide">
                                Data required: Job Title, Region, Tenure, and Operational Descriptions to generate Audit results.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
