import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { sendChatMessage } from '../api/client';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'ai', content: "नमस्ते! मैं स्किलमिराज (SkillMirage) सहायक हूँ। आप मुझसे अपने करियर, एआई जोखिम या सीखने के रास्तों के बारे में हिंदी या अंग्रेजी में पूछ सकते हैं!" }
    ]);
    const [inputVal, setInputVal] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [language, setLanguage] = useState("English");

    const endOfMessagesRef = useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputVal.trim()) return;

        const userMsg = inputVal.trim();
        setInputVal("");

        setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Using existing logic to get profile context if available
            const profileStr = localStorage.getItem('user_profile');
            const profile = profileStr ? JSON.parse(profileStr) : {};

            const res = await sendChatMessage({
                message: userMsg,
                language,
                job_title: profile.job_title,
                city: profile.city,
                experience: profile.experience_years ? parseFloat(profile.experience_years) : 0
            });
            setMessages(prev => [...prev, { id: Date.now(), type: 'ai', content: res.reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: Date.now(), type: 'ai', content: "मुझे क्षमा करें, सेवा अभी उपलब्ध नहीं है। / Sorry, the service is currently unavailable." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {isOpen ? (
                <div className="glass-card neon-border w-80 sm:w-96 h-[30rem] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm">SkillRadar Assistant</h3>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="bg-slate-800/80 text-white text-[10px] rounded px-1.5 py-0.5 outline-none border border-white/20 cursor-pointer backdrop-blur-sm"
                                    >
                                        <option value="English" className="bg-slate-800 text-white">EN</option>
                                        <option value="Hindi" className="bg-slate-800 text-white">HI</option>
                                    </select>
                                </div>
                                <span className="text-[10px] bg-green-500/20 text-green-100 px-1.5 py-0.5 rounded-full flex w-fit items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-900/50 space-y-4 no-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto shadow-sm
                    ${msg.type === 'user' ? 'bg-primary-500 text-white' : 'bg-slate-800 text-primary-400 border border-slate-700'}`}>
                                        {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm
                    ${msg.type === 'user'
                                            ? 'bg-primary-600 text-white rounded-br-none'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2 max-w-[85%] flex-row">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto shadow-sm bg-slate-800 text-primary-400 border border-slate-700">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="p-4 rounded-2xl text-sm shadow-sm bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={endOfMessagesRef} />
                    </div>

                    {/* Quick actions */}
                    <div className="px-4 py-2 bg-slate-900/80 flex gap-2 overflow-x-auto no-scrollbar border-y border-slate-800">
                        <button onClick={() => setInputVal("Why is my risk score high?")} className="shrink-0 text-xs bg-slate-800 border border-primary-500/30 text-primary-300 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-700 transition-colors whitespace-nowrap">Why is my risk score high?</button>
                        <button onClick={() => setInputVal("What are safe jobs?")} className="shrink-0 text-xs bg-slate-800 border border-primary-500/30 text-primary-300 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-700 transition-colors whitespace-nowrap">What are safe jobs?</button>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 flex gap-2 border-t border-slate-700/50" style={{ backgroundColor: '#0f172a' }}>
                        <input
                            type="text"
                            placeholder="Ask a question..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 border border-slate-600 placeholder-slate-400"
                            style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                        />
                        <button
                            type="submit"
                            disabled={!inputVal.trim()}
                            className="bg-primary-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-full shadow-2xl hover:shadow-black/20 transition-all transform hover:scale-105 group relative"
                >
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <MessageSquare className="w-7 h-7" />
                    <div className="absolute opacity-0 group-hover:opacity-100 right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-sm font-semibold whitespace-nowrap px-4 py-2 rounded-xl transition-all shadow-xl pointer-events-none after:content-[''] after:absolute after:top-1/2 after:left-full after:-translate-y-1/2 after:-translate-x-1 after:border-8 after:border-transparent after:border-l-slate-800">
                        Chat & Ask in Hindi
                    </div>
                </button>
            )}
        </div>
    );
}
