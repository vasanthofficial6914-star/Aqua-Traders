import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';
import API_BASE_URL from '../config/api';


interface Message {
    sender: 'ai' | 'user';
    text: string;
}

interface AIAssistantProps {
    role: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const welcomeMessage = role === 'fisherman'
            ? "Vanakkam Captain! 🚢 I'm your AI Catch Assistant. Need advice on pricing, weather, or net maintenance?"
            : role === 'customer'
                ? "Hello! 🌊 I'm your Fresh Guide. Looking for the best catch today or need a recipe for Seer Fish?"
                : "Welcome to மீனவன்! 🛥️ How can I help you today?";

        setMessages([{ sender: 'ai', text: welcomeMessage }]);
    }, [role]);

    // Handle Proactive Alerts & External Open Signals
    useEffect(() => {
        const handleAlert = (e: any) => {
            const { issueType, load } = e.detail;

            let alertMsg = "";
            switch (issueType) {
                case 'OVERLOAD':
                    alertMsg = `🚨 Captain, I've detected an OVERLOAD (${load}kg)! Stop the motor immediately. I can guide you through manual recovery if needed.`;
                    break;
                case 'TANGLE':
                    alertMsg = `🌀 WARNING: Net Tangle detected! I recommend backing down the vessel and checking line tension.`;
                    break;
                case 'TEAR':
                    alertMsg = `❌ CRITICAL: Net Tearing detected! Haul in what you can immediately.`;
                    break;
            }

            if (alertMsg) {
                setMessages(prev => [...prev, { sender: 'ai', text: alertMsg }]);
                // Removed setIsOpen(true) to prevent auto-opening as per request
            }
        };

        const handleExternalOpen = () => setIsOpen(true);

        window.addEventListener('custom:net-alert', handleAlert);
        window.addEventListener('ai:open', handleExternalOpen);

        return () => {
            window.removeEventListener('custom:net-alert', handleAlert);
            window.removeEventListener('ai:open', handleExternalOpen);
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { sender: 'user', text: input } as Message;
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');

        try {
            const response = await fetch(`${API_BASE_URL}/services/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages, role })
            });

            const data = await response.json();
            setMessages([...newMessages, { sender: 'ai', text: data.text }]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages([...newMessages, { sender: 'ai', text: "Sorry, I lost my connection to the sea. Check if the server is running!" }]);
        }
    };

    return (
        <>
            {/* 1. Floating AI Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-neon-400 text-ocean-950 flex items-center justify-center shadow-neon-glow z-[2000] border-none cursor-pointer"
                >
                    <Bot size={28} />
                </motion.button>
            )}

            {/* 2. Chat Panel with Framer Motion Slide Animation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-ocean-950/95 backdrop-blur-xl border-l border-white/10 z-[3000] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-ocean-900 to-ocean-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neon-400/20 rounded-lg text-neon-400">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold tracking-wide m-0">AI Fleet Assistant</h3>
                                    <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest m-0">Real-time Telemetry & Advice</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all border-none bg-transparent"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar"
                        >
                            {messages.map((msg, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={index}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.sender === 'user'
                                        ? 'bg-neon-400 text-ocean-950 font-medium rounded-tr-none'
                                        : 'bg-white/10 text-white border border-white/5 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-white/10 bg-ocean-900/50">
                            <div className="flex gap-3 bg-white/5 rounded-2xl p-2 border border-white/10 focus-within:border-neon-400/50 transition-all">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 bg-transparent border-none text-white outline-none px-3 text-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className={`p-3 rounded-xl transition-all ${input.trim()
                                        ? 'bg-neon-400 text-ocean-950 hover:scale-105 active:scale-95'
                                        : 'bg-white/5 text-white/20'
                                        }`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistant;
