import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import {
  Compass,
  User,
  RefreshCw,
  LayoutDashboard,
  BarChart3,
  IndianRupee,
  UserPlus,
  Sun,
  Moon,
  TrendingUp,
  Shield,
  Building2
} from 'lucide-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import WorkerIntelligence from './pages/WorkerIntelligence';
import ReskillingPaths from './pages/ReskillingPaths';
import UserProfile from './pages/UserProfile';
import ChatbotWidget from './components/ChatbotWidget';
import Welcome from './pages/Welcome';
import SalaryExplorer from './pages/SalaryExplorer';
import BackgroundEffect from './components/BackgroundEffect';
import Login from './pages/Login';
import Register from './pages/Register';
import Analytics from './pages/Analytics';
import SkillsIntelligence from './pages/SkillsIntelligence';
import VulnerabilityHeatmap from './pages/VulnerabilityHeatmap';
import EmployerDashboard from './pages/EmployerDashboard';
import './App.css';

// Simple protected route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <BrowserRouter>
      {/* Animated Background always present */}
      <BackgroundEffect />
      <ChatbotWidget />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Layout catching anything else if logged in */}
        <Route path="*" element={
          <ProtectedRoute>
            <div className="flex h-screen transition-colors duration-500 bg-[var(--bg-color)] text-[var(--text-color)]">
              {/* Sidebar - Modern & Theme Reactive */}
              <aside className="w-72 bg-slate-900/5 dark:bg-black/40 backdrop-blur-3xl border-r border-black/5 dark:border-white/10 flex flex-col transition-all duration-500 z-50">
                <div className="p-10">
                  <Link to="/" className="flex items-center gap-4 group">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg group-hover:rotate-[10deg] transition-transform">
                      <Compass className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-black tracking-tighter uppercase italic">Mirage</h1>
                      <p className="text-[9px] text-primary-500 font-black tracking-[0.4em] uppercase">Neural Hub</p>
                    </div>
                  </Link>
                </div>

                <nav className="flex-1 px-6 space-y-3 mt-6">
                  {[
                    { to: "/dashboard", icon: LayoutDashboard, label: "Market Center" },
                    { to: "/analytics", icon: BarChart3, label: "Market Analytics" },
                    { to: "/skills-intel", icon: TrendingUp, label: "Skills Intel" },
                    { to: "/vulnerability", icon: Shield, label: "AI Vulnerability" },
                    { to: "/profile", icon: UserPlus, label: "Neural Profile" },
                    { to: "/intelligence", icon: User, label: "Worker Signal" },
                    { to: "/reskilling", icon: RefreshCw, label: "Reskill Path" },
                    { to: "/salary", icon: IndianRupee, label: "Salary Nexus" },
                    { to: "/employer", icon: Building2, label: "Employer Intel" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="group flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-primary-500 hover:from-purple-500 hover:to-blue-500/5 rounded-[1.5rem] transition-all font-black text-xs uppercase tracking-widest border border-transparent hover:border-primary-500/10"
                    >
                      <item.icon className="w-5 h-5 transition-colors" />
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="p-8 space-y-6">
                  {/* Theme Toggle in Sidebar */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-6 py-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-all font-sans"
                  >
                    <span>{theme === 'dark' ? 'Neural Dark' : 'Optic Light'}</span>
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem('isAuthenticated');
                      window.location.href = '/login';
                    }}
                    className="w-full py-4 text-[10px] font-black tracking-[0.3em] text-slate-400 hover:text-red-500 transition-colors uppercase italic border-t border-black/5 dark:border-white/5 pt-8"
                  >
                    Terminate Session
                  </button>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 overflow-auto relative">
                <div className="p-10 max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/intelligence" element={<WorkerIntelligence />} />
                    <Route path="/reskilling" element={<ReskillingPaths />} />
                    <Route path="/salary" element={<SalaryExplorer />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/skills-intel" element={<SkillsIntelligence />} />
                    <Route path="/vulnerability" element={<VulnerabilityHeatmap />} />
                    <Route path="/employer" element={<EmployerDashboard />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
