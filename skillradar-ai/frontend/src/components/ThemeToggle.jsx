import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check local storage or system preference on mount
        const theme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (theme === 'dark' || (!theme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-950 dark:hover:bg-slate-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 overflow-hidden relative group"
            aria-label="Toggle Dark Mode"
        >
            <div className="relative z-10">
                {isDark ? (
                    <Sun className="w-5 h-5 text-warning-500 transition-transform duration-300 transform group-hover:rotate-45" />
                ) : (
                    <Moon className="w-5 h-5 text-slate-200 dark:text-slate-300 transition-transform duration-300 transform group-hover:-rotate-12" />
                )}
            </div>
            <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
        </button>
    );
}
