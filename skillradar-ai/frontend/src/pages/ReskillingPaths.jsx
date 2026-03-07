import React, { useState } from 'react';
import axios from 'axios';
import {
    BookOpen, GraduationCap, Target, Clock, ArrowRightCircle,
    Sparkles, ChevronRight, Zap, ExternalLink, Award, Globe, RefreshCw
} from 'lucide-react';

export default function ReskillingPaths() {
    const [mode, setMode] = useState('transition'); // 'transition' or 'upgrade'
    const [formData, setFormData] = useState({
        target_role: 'Data Scientist',
        current_skills: 'Python, Excel',
        current_role: 'Data Analyst'
    });
    const [loading, setLoading] = useState(false);
    const [path, setPath] = useState(null);

    // Dynamic mock generator based on user inputs
    const generateDynamicMock = (targetRole, currentRole, skills, currentMode) => {
        const roleTopics = {
            'data scientist': [
                { topic: 'Python for ML', course: 'Machine Learning with Python', platform: 'NPTEL', hours: 6 },
                { topic: 'Statistical Modeling', course: 'Statistics for Data Science', platform: 'SWAYAM', hours: 5 },
                { topic: 'Deep Learning Fundamentals', course: 'Neural Networks & Deep Learning', platform: 'NPTEL', hours: 7 },
                { topic: 'Data Wrangling & EDA', course: 'Data Analysis with Pandas', platform: 'SWAYAM', hours: 4 },
                { topic: 'Model Deployment', course: 'MLOps Fundamentals', platform: 'NPTEL', hours: 5 },
                { topic: 'Capstone Project', course: 'Applied ML Project', platform: 'SWAYAM', hours: 8 },
            ],
            'data engineer': [
                { topic: 'SQL & Database Design', course: 'Advanced SQL for Analytics', platform: 'NPTEL', hours: 5 },
                { topic: 'ETL Pipeline Design', course: 'Data Pipeline Engineering', platform: 'SWAYAM', hours: 6 },
                { topic: 'Cloud Data Infrastructure', course: 'Cloud Computing Essentials', platform: 'NPTEL', hours: 6 },
                { topic: 'Big Data Processing', course: 'Apache Spark & Hadoop', platform: 'SWAYAM', hours: 7 },
                { topic: 'Data Warehousing', course: 'Modern Data Warehouse Design', platform: 'NPTEL', hours: 5 },
                { topic: 'Orchestration & Monitoring', course: 'Airflow & Data Ops', platform: 'SWAYAM', hours: 5 },
            ],
            'software engineer': [
                { topic: 'Web Fundamentals', course: 'Full Stack Web Development', platform: 'NPTEL', hours: 6 },
                { topic: 'Backend Architecture', course: 'System Design & APIs', platform: 'SWAYAM', hours: 7 },
                { topic: 'Frontend Frameworks', course: 'React & Modern UI', platform: 'NPTEL', hours: 5 },
                { topic: 'Database Integration', course: 'Database Management Systems', platform: 'NPTEL', hours: 5 },
                { topic: 'DevOps & CI/CD', course: 'DevOps Engineering', platform: 'SWAYAM', hours: 6 },
                { topic: 'Testing & Quality', course: 'Software Testing Practices', platform: 'NPTEL', hours: 4 },
            ],
            'digital marketing': [
                { topic: 'SEO & Analytics', course: 'Search Engine Optimization', platform: 'SWAYAM', hours: 4 },
                { topic: 'Content Strategy', course: 'Content Marketing Mastery', platform: 'NPTEL', hours: 5 },
                { topic: 'Social Media Marketing', course: 'Social Media Strategy', platform: 'SWAYAM', hours: 4 },
                { topic: 'PPC & Ad Campaigns', course: 'Google Ads & PPC', platform: 'NPTEL', hours: 5 },
                { topic: 'Email Marketing', course: 'Email Marketing Automation', platform: 'SWAYAM', hours: 3 },
                { topic: 'Marketing Analytics', course: 'Data-Driven Marketing', platform: 'NPTEL', hours: 6 },
            ],
            'product manager': [
                { topic: 'Product Strategy', course: 'Product Management Fundamentals', platform: 'SWAYAM', hours: 5 },
                { topic: 'User Research & UX', course: 'UX Research Methods', platform: 'NPTEL', hours: 4 },
                { topic: 'Agile & Scrum', course: 'Agile Project Management', platform: 'SWAYAM', hours: 4 },
                { topic: 'Data-Driven Decisions', course: 'Analytics for PMs', platform: 'NPTEL', hours: 5 },
                { topic: 'Roadmap & Prioritization', course: 'Strategic Product Planning', platform: 'SWAYAM', hours: 5 },
                { topic: 'Go-to-Market Strategy', course: 'Product Launch & GTM', platform: 'NPTEL', hours: 6 },
            ],
            'cloud architect': [
                { topic: 'Cloud Fundamentals', course: 'Cloud Computing Basics', platform: 'NPTEL', hours: 5 },
                { topic: 'AWS Core Services', course: 'AWS Solutions Architect', platform: 'SWAYAM', hours: 7 },
                { topic: 'Infrastructure as Code', course: 'Terraform & CloudFormation', platform: 'NPTEL', hours: 6 },
                { topic: 'Microservices Architecture', course: 'Microservices & Containers', platform: 'SWAYAM', hours: 6 },
                { topic: 'Security & Compliance', course: 'Cloud Security Essentials', platform: 'NPTEL', hours: 5 },
                { topic: 'Cost Optimization', course: 'Cloud Cost Management', platform: 'SWAYAM', hours: 4 },
            ],
            'cybersecurity analyst': [
                { topic: 'Network Security', course: 'Network Security Fundamentals', platform: 'NPTEL', hours: 6 },
                { topic: 'Ethical Hacking', course: 'Penetration Testing Basics', platform: 'SWAYAM', hours: 7 },
                { topic: 'Cryptography', course: 'Applied Cryptography', platform: 'NPTEL', hours: 5 },
                { topic: 'Incident Response', course: 'Security Incident Management', platform: 'SWAYAM', hours: 5 },
                { topic: 'Security Compliance', course: 'ISO 27001 & GDPR', platform: 'NPTEL', hours: 4 },
                { topic: 'Threat Intelligence', course: 'Cyber Threat Analysis', platform: 'SWAYAM', hours: 6 },
            ],
            'business analyst': [
                { topic: 'Business Analysis Fundamentals', course: 'Business Analysis Essentials', platform: 'SWAYAM', hours: 5 },
                { topic: 'Requirements Engineering', course: 'Requirements Gathering & Modeling', platform: 'NPTEL', hours: 5 },
                { topic: 'Data Visualization', course: 'Tableau & PowerBI Mastery', platform: 'SWAYAM', hours: 6 },
                { topic: 'Process Mapping', course: 'Business Process Optimization', platform: 'NPTEL', hours: 4 },
                { topic: 'SQL for Analysts', course: 'SQL Data Analysis', platform: 'SWAYAM', hours: 5 },
                { topic: 'Stakeholder Management', course: 'Communication & Presentation', platform: 'NPTEL', hours: 4 },
            ],
        };

        // Find best matching role topics
        const roleLower = targetRole.toLowerCase();
        let topics = null;
        for (const [key, val] of Object.entries(roleTopics)) {
            if (roleLower.includes(key) || key.includes(roleLower)) {
                topics = val;
                break;
            }
        }

        // Generic fallback based on keywords in the role
        if (!topics) {
            const keywords = roleLower.split(/[\s,]+/);
            if (keywords.some(k => ['data', 'analytics', 'analyst'].includes(k))) {
                topics = roleTopics['data scientist'];
            } else if (keywords.some(k => ['web', 'developer', 'frontend', 'backend', 'fullstack'].includes(k))) {
                topics = roleTopics['software engineer'];
            } else if (keywords.some(k => ['marketing', 'seo', 'content'].includes(k))) {
                topics = roleTopics['digital marketing'];
            } else if (keywords.some(k => ['cloud', 'devops', 'infrastructure'].includes(k))) {
                topics = roleTopics['cloud architect'];
            } else if (keywords.some(k => ['security', 'cyber', 'hacking'].includes(k))) {
                topics = roleTopics['cybersecurity analyst'];
            } else if (keywords.some(k => ['product', 'manager', 'pm'].includes(k))) {
                topics = roleTopics['product manager'];
            } else {
                // Ultimate fallback — generate generic topics from the role name
                topics = [
                    { topic: `${targetRole} Foundations`, course: `Introduction to ${targetRole}`, platform: 'NPTEL', hours: 5 },
                    { topic: `Core ${targetRole} Skills`, course: `${targetRole} Essentials`, platform: 'SWAYAM', hours: 6 },
                    { topic: `Advanced ${targetRole} Concepts`, course: `Advanced ${targetRole}`, platform: 'NPTEL', hours: 6 },
                    { topic: `Tools & Technologies`, course: `${targetRole} Tools & Ecosystem`, platform: 'SWAYAM', hours: 5 },
                    { topic: `Industry Best Practices`, course: `${targetRole} in Practice`, platform: 'NPTEL', hours: 5 },
                    { topic: `Capstone Project`, course: `Applied ${targetRole} Project`, platform: 'SWAYAM', hours: 7 },
                ];
            }
        }

        // Filter out topics related to skills user already has
        const existingSkills = skills.map(s => s.toLowerCase());
        const filteredTopics = topics.filter(t => {
            const topicLower = t.topic.toLowerCase();
            const courseLower = t.course.toLowerCase();
            return !existingSkills.some(s => topicLower.includes(s) || courseLower.includes(s));
        });
        const finalTopics = filteredTopics.length >= 3 ? filteredTopics : topics;

        const weekCount = Math.max(4, Math.min(16, finalTopics.length * 2));

        const getUrl = (name, platform) => {
            const search = name.replace(/ /g, '+');
            if (platform === 'NPTEL') return `https://nptel.ac.in/courses?q=${search}`;
            if (platform === 'SWAYAM') return `https://swayam.gov.in/explorer?searchText=${search}`;
            return `https://www.google.com/search?q=${search}+${platform}`;
        };

        const weekly_plan = finalTopics.map((t, i) => ({
            week: i + 1,
            topic: t.topic,
            course: t.course,
            platform: t.platform,
            hours: t.hours,
            url: getUrl(t.course, t.platform),
        }));

        const modeLabel = currentMode === 'upgrade' ? 'Skill Upgrade Mode' : 'Career Transition';
        const transferPct = Math.floor(30 + Math.random() * 40); // 30-70%
        const insight = currentMode === 'upgrade'
            ? `Strategic Pivot Recommendation: Your profile indicates an optimal path via ${modeLabel}. By deepening your expertise as a ${currentRole}, you can achieve senior-level market resilience and increase your Salary Impact by ${10 + Math.floor(Math.random() * 15)}%.`
            : `Strategic Pivot Recommendation: Your profile indicates an optimal path via ${modeLabel}. Transitioning to ${targetRole} leverages ${transferPct}% of your current neural assets while moving you away from high-automation risk roles.`;

        return {
            target_role: targetRole,
            estimated_duration_weeks: weekCount,
            insight,
            weekly_plan,
        };
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const skillsArray = formData.current_skills.split(',').map(s => s.trim()).filter(s => s);
            const response = await axios.post('http://127.0.0.1:8000/api/reskilling/path', {
                target_role: formData.target_role,
                current_skills: skillsArray,
                current_role: formData.current_role,
                mode: mode
            });

            // Fallback to mock if backend dataset is missing and returns empty plan
            if (!response.data || !response.data.weekly_plan || response.data.weekly_plan.length === 0) {
                throw new Error("Empty weekly_plan returned from API - using frontend mock generation.");
            }

            setPath(response.data);
        } catch (err) {
            console.error(err);
            // Dynamic fallback based on user inputs
            const skillsArray = formData.current_skills.split(',').map(s => s.trim()).filter(s => s);
            setPath(generateDynamicMock(formData.target_role, formData.current_role, skillsArray, mode));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic text-primary-500">Neural Roadmap</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[8px] mt-1">Personalized Reskilling Trajectory & Pivot Strategy</p>
            </div>

            {/* Mode Selector Toggle */}
            <div className="flex items-center gap-4 bg-slate-900/5 dark:bg-black/20 p-2 rounded-[2rem] border border-black/5 dark:border-white/10 backdrop-blur-xl w-fit">
                <button
                    onClick={() => setMode('transition')}
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'transition' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-primary-600/20' : 'text-slate-500 hover:text-primary-400'
                        }`}
                >
                    Career Transition
                </button>
                <button
                    onClick={() => setMode('upgrade')}
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'upgrade' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-primary-600/20' : 'text-slate-500 hover:text-primary-400'
                        }`}
                >
                    Skill Upgrade
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Configuration Panel */}
                <div className="xl:col-span-1 space-y-8">
                    <form onSubmit={handleSubmit} className="glass-card p-10 space-y-6">
                        <h2 className="text-2xl font-black italic tracking-tighter mb-6 flex items-center gap-4">
                            <Target className="w-6 h-6 text-primary-500" />
                            Trajectory Config
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Current Neural Baseline (Role)</label>
                                <input
                                    className="w-full bg-slate-900/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500"
                                    value={formData.current_role}
                                    onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                                />
                            </div>

                            {mode === 'transition' && (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Objective (Role)</label>
                                    <input
                                        className="w-full bg-slate-900/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500"
                                        value={formData.target_role}
                                        onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Current Assets (Skills)</label>
                                <textarea
                                    className="w-full bg-slate-900/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 h-24"
                                    value={formData.current_skills}
                                    onChange={(e) => setFormData({ ...formData, current_skills: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary-600/20 uppercase tracking-widest text-[10px] flex items-center justify-center gap-4"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Compile Roadmap</>}
                            </button>
                        </div>
                    </form>

                    {path && (
                        <div className="glass-card p-8 bg-gradient-to-r from-purple-600 to-blue-600/5 border-primary-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-5 h-5 text-primary-500" />
                                <h3 className="font-black italic tracking-tighter">Pivot Insights</h3>
                            </div>
                            <p className="text-sm text-slate-400 font-bold leading-relaxed">
                                {path.insight}
                            </p>
                        </div>
                    )}
                </div>

                {/* Timeline / Roadmap View */}
                <div className="xl:col-span-2 space-y-12">
                    {path ? (
                        <div className="space-y-10">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase">Vertical Learning Timeline</h2>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Duration Estimate</p>
                                        <p className="text-xl font-black italic text-primary-500">{path.estimated_duration_weeks} WEEKS</p>
                                    </div>
                                </div>
                            </div>

                            {/* Roadmap Steps */}
                            <div className="relative border-l-2 border-primary-500/20 ml-6 space-y-12 pb-12">
                                {path.weekly_plan?.map((step, i) => (
                                    <div
                                        key={i}
                                        className="relative pl-12"
                                    >
                                        <div className="absolute w-4 h-4 bg-primary-500 rounded-full left-[-9px] top-1 shadow-[0_0_15px_rgba(124,58,237,0.5)] ring-4 ring-[var(--bg-color)]" />

                                        <div className="glass-card p-8 border-l-4 border-primary-500 hover:translate-x-2 transition-transform">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full">Week {step.week}</span>
                                                    <h3 className="text-2xl font-black italic tracking-tighter mt-2">{step.topic}</h3>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-slate-500" />
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{step.hours} HRS / WEEK</span>
                                                </div>
                                            </div>

                                            <p className="text-slate-500 font-bold text-sm mb-6 leading-relaxed">Focus on mastering neural configurations and core syntax patterns for {step.topic}.</p>

                                            <div className="p-6 bg-black/5 dark:bg-slate-900/5 rounded-2xl border border-black/5 dark:border-white/10 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600/10 rounded-xl">
                                                        <Globe className="w-5 h-5 text-primary-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{step.platform}</p>
                                                        <h4 className="font-black italic text-sm">{step.course}</h4>
                                                    </div>
                                                </div>
                                                <a
                                                    href={step.url || "#"}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-3 hover:from-purple-500 hover:to-blue-500 text-slate-400 hover:text-white rounded-xl transition-all border border-white/10"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                            <BookOpen className="w-24 h-24" />
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase">Roadmap Pending Configuration</h3>
                            <p className="text-sm font-bold uppercase tracking-widest">Input your neural baseline to generate a trajectory</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
