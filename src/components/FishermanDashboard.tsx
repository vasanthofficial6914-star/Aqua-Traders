import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isSeasonalRegulationActive } from "../utils/dateUtils";
import { useHardwareWeight } from "../hooks/useHardwareWeight";
import { API_BASE_URL } from "../config";
import {
    Fish,
    ClipboardList,
    BarChart3,
    ScrollText,
    Lightbulb,
    Anchor,
    Home,
    User,
    Plus,
    ShieldAlert,
    Bell,
    ArrowLeft,
    Trash2,
    PackageCheck,
    PackageX,
    LayoutList,
    Bot
} from "lucide-react";

// ---------- PREMIUM STYLES ----------
// Removed static style objects in favor of Tailwind classes

const FishermanDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState<"home" | "upload" | "orders" | "income" | "schemes" | "advice" | "profile" | "net-monitor" | "listings">("home");
    const [myListings, setMyListings] = useState<any[]>([]);
    const [lang, setLang] = useState<"en" | "ta">("en");
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);
    const [expenses] = useState({ fuel: 0, ice: 0, wages: 0, repairs: 0, other: 0 });
    const [revenue] = useState(15400);
    const [weather] = useState<"Sunny" | "Cloudy" | "Stormy">("Sunny");
    const [orders] = useState([
        { id: "ORD-9921", customer: "The Grand Marina", items: "Seer Fish (5kg)", amount: 2500, status: "Pending", time: "10:30 AM" },
        { id: "ORD-9920", customer: "Coastline Bistro", items: "Mackerel (12kg)", amount: 3600, status: "Completed", time: "Yesterday" },
        { id: "ORD-9919", customer: "Annai Seafoods", items: "Tuna (8kg)", amount: 4000, status: "Completed", time: "Yesterday" },
    ]);

    // ---------- NET MONITOR STATE ----------
    const [netLoad, setNetLoad] = useState(0);
    const [netStatus, setNetStatus] = useState<'SAFE' | 'STOP'>('SAFE');
    const [isManualMode, setIsManualMode] = useState(false);
    const [lastAlertSent, setLastAlertSent] = useState<number>(0);
    const [activeIssue, setActiveIssue] = useState<'NONE' | 'OVERLOAD' | 'TANGLE' | 'TEAR'>('NONE');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { weight: hardwareWeight, isOffline: hardwareOffline } = useHardwareWeight();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Sync state with hardware data
    useEffect(() => {
        if (!isManualMode && !hardwareOffline && hardwareWeight !== null) {
            setNetLoad(hardwareWeight);
            setNetStatus(hardwareWeight >= 50 ? 'STOP' : 'SAFE');
        }
    }, [hardwareWeight, hardwareOffline, isManualMode]);

    const updateManualLoad = (val: number) => {
        setNetLoad(val);
        setNetStatus(val >= 50 ? 'STOP' : 'SAFE');
    };

    const getStressLevel = (load: number) => {
        if (load < 20) return "LOW";
        if (load < 50) return "MEDIUM";
        return "HIGH";
    };

    // ---------- EMAIL ALERT TRIGGER ----------
    useEffect(() => {
        const triggerEmailAlert = async () => {
            const now = Date.now();

            // Determine the issue type
            let currentIssue: 'NONE' | 'OVERLOAD' | 'TANGLE' | 'TEAR' = 'NONE';
            if (netStatus === 'STOP') currentIssue = 'OVERLOAD';
            if (activeIssue !== 'NONE') currentIssue = activeIssue;

            // 5 minute cooldown (300000ms)
            if (currentIssue !== 'NONE' && (now - lastAlertSent > 300000)) {
                try {
                    console.log(`Triggering ${currentIssue} alert...`);
                    const response = await fetch(`${API_BASE_URL}/services/alert`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            load: netLoad,
                            status: netStatus,
                            fisherman: 'Captain Viswanathan',
                            issueType: currentIssue
                        })
                    });
                    if (response.ok) {
                        setLastAlertSent(now);
                        console.log(`${currentIssue} alert triggered successfully`);
                    }
                } catch (error) {
                    console.error("Failed to trigger alert email:", error);
                }
            }

            // Dispatch custom event for AI Chatbot
            if (currentIssue !== 'NONE') {
                window.dispatchEvent(new CustomEvent('custom:net-alert', {
                    detail: { issueType: currentIssue, load: netLoad }
                }));
            }
        };

        triggerEmailAlert();
    }, [netStatus, netLoad, lastAlertSent, activeIssue]);

    const isRegulationActive = isSeasonalRegulationActive();
    const totalExpenses = expenses.fuel + expenses.ice + expenses.wages + expenses.repairs + expenses.other;
    const profit = revenue - totalExpenses;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0";

    const fetchMyListings = async () => {
        try {
            const token = localStorage.getItem('fisherDirectToken');
            const res = await fetch(`${API_BASE_URL}/fish/mylistings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyListings(data);
            }
        } catch (err) {
            console.error("Failed to fetch my listings", err);
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            const token = localStorage.getItem('fisherDirectToken');
            const res = await fetch(`${API_BASE_URL}/fish/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Listing deleted successfully!");
                fetchMyListings();
            } else {
                const data = await res.json();
                alert("Delete failed: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server");
        }
    };

    useEffect(() => {
        if (activeView === 'listings' || activeView === 'upload') {
            fetchMyListings();
        }
    }, [activeView]);

    const handleUpdateStockStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'in_stock' ? 'stock_out' : 'in_stock';
        try {
            console.log(`Updating stock status for ${id} to ${newStatus}...`);
            const token = localStorage.getItem('fisherDirectToken');
            const res = await fetch(`${API_BASE_URL}/fish/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                console.log("Stock status updated successfully:", data);
                fetchMyListings();
            } else {
                console.error("Update failed:", data);
                alert(`Failed: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Network error during status update:", err);
            alert("Error connecting to server to update stock status");
        }
    };

    // ---------- SYNC LOGIC ----------
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // ---------- UI HELPERS ----------
    const t = {
        en: {
            title: "FisherDirect",
            welcome: "Captain's Dashboard",
            advice_title: "TODAY'S SMART ADVICE",
            upload: "Upload Fish",
            orders: "Orders",
            income: "Income Insights",
            schemes: "Govt Schemes",
            advice: "Today's Advice",
            profile: "Profile",
            net_monitor: "Net Monitor 📡",
            listings: "My Listings",
            switch: "தமிழ்",
        },
        ta: {
            title: "ஃபிஷர்டைரக்ட்",
            welcome: "கேப்டன் டாஷ்போர்டு",
            advice_title: "இன்றைய ஸ்மார்ட் அறிவுரை",
            upload: "மீன் பதிவேற்றம்",
            orders: "ஆர்டர்கள்",
            income: "வருமான விவரம்",
            schemes: "அரசு திட்டங்கள்",
            advice: "இன்றைய அறிவுரை",
            profile: "சுயவிவரம்",
            net_monitor: "வலை கண்காணிப்பு",
            listings: "எனது பதிவுகள்",
            switch: "English",
        }
    };

    const currentT = t[lang];

    const getAdviceSummary = () => {
        if (isRegulationActive) return lang === 'en' ? "Ban active. Avoid sea. Apply for relief." : "மீன்பிடி தடைக்காலம். நிவாரணத்திற்கு விண்ணப்பிக்கவும்.";
        if (weather === 'Stormy') return lang === 'en' ? "Storm alert. High risk category." : "புயல் எச்சரிக்கை. அதிக ஆபத்து.";
        return lang === 'en' ? "Strong currents today. Focus on dried fish." : "இன்று நீரோட்டம் அதிகம். கருவாட்டுக்கு முக்கியத்துவம் கொடுங்கள்.";
    };

    return (
        <div className="pb-24 relative z-10 text-white min-h-screen">
            {/* ---------- HEADER ---------- */}
            <header className="glass-nav sticky top-0 z-[100] px-6 py-4 flex justify-between items-center border-b border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                    <Fish className="text-neon-400 drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]" size={32} />
                    <h1 className="text-xl font-semibold text-white tracking-wide drop-shadow-sm">{currentT.title}</h1>
                </div>
                <div className="flex gap-4 items-center">
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${isOnline ? 'bg-neon-400 text-neon-400' : 'bg-red-500 text-red-500'}`}></div>
                    <button
                        onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
                        className="bg-white/10 hover:bg-white/20 transition-colors border-none text-white px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md"
                    >
                        {currentT.switch}
                    </button>
                    <div className="text-xl cursor-pointer hover:scale-110 transition-transform drop-shadow-md text-white/70 hover:text-white">
                        <Bell size={24} />
                    </div>
                </div>
            </header>

            {/* ---------- CONTENT ---------- */}
            <main className="w-full px-4 md:px-8 py-8">
                {activeView === "home" && (
                    <div className="animate-fade-in">
                        <div className="glass-card mb-6 p-6 border-l-4 border-l-neon-400 bg-ocean-800/40">
                            <div className="flex gap-2 items-center mb-2">
                                <ShieldAlert size={18} className="text-neon-400 drop-shadow-[0_0_5px_#00f5ff]" />
                                <span className="text-xs font-bold text-white/50 tracking-widest uppercase">{currentT.advice_title}</span>
                            </div>
                            <p className="m-0 text-base text-white/90 font-medium tracking-wide">
                                {getAdviceSummary()}
                            </p>
                            <div className="text-xs text-red-500 mt-2 font-bold uppercase tracking-wider shadow-red-500/50 drop-shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse"></span> Risk: Moderate
                            </div>
                        </div>

                        <div className="w-full mb-8" style={{
                            background: netStatus === 'STOP' ? '#fee2e2' : '#dcfce7',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: `2px solid ${netStatus === 'STOP' ? '#ef4444' : '#22c55e'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            animation: netStatus === 'STOP' ? 'pulse 1.5s infinite' : 'none'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>SMART NET MONITOR</span>
                                <div style={{
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '12px',
                                    backgroundColor: netStatus === 'STOP' ? '#ef4444' : '#22c55e',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 800
                                }}>
                                    {netStatus}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>LOAD VALUE</div>
                                    {isManualMode ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                type="number"
                                                value={netLoad}
                                                onChange={(e) => updateManualLoad(Number(e.target.value))}
                                                style={{ width: '80px', fontSize: '1.5rem', padding: '0.2rem', borderRadius: '8px', border: '1px solid #0ea5e9' }}
                                            />
                                            <span style={{ fontSize: '1rem', fontWeight: 700 }}>kg</span>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: hardwareOffline ? '1.2rem' : '2rem', fontWeight: 900, color: '#1e293b' }}>
                                            {hardwareOffline ? (
                                                <span style={{ color: '#ef4444' }}>Hardware Offline</span>
                                            ) : (
                                                hardwareWeight ? `${hardwareWeight} kg` : "Waiting for hardware..."
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>STRESS</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: netLoad >= 50 ? '#ef4444' : '#1e293b' }}>
                                        {hardwareOffline ? '---' : getStressLevel(netLoad)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button
                                    onClick={() => setIsManualMode(!isManualMode)}
                                    style={{
                                        flex: 2,
                                        padding: '0.6rem',
                                        borderRadius: '10px',
                                        border: '1px solid #0ea5e9',
                                        backgroundColor: isManualMode ? '#0ea5e9' : 'white',
                                        color: isManualMode ? 'white' : '#0ea5e9',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isManualMode ? 'RESUME LIVE' : 'MANUAL INPUT'}
                                </button>
                                {netStatus === 'STOP' && (
                                    <div style={{ flex: 3, color: '#b91c1c', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        ⚠ PULL NET NOW!
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => setActiveView("upload")}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-400/50 transition-all">
                                    <Fish size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-neon-400 transition-colors uppercase tracking-wider">{currentT.upload}</span>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => setActiveView("orders")}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-400/50 transition-all">
                                    <ClipboardList size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-neon-400 transition-colors uppercase tracking-wider">{currentT.orders}</span>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => setActiveView("income")}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-400/50 transition-all">
                                    <BarChart3 size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-neon-400 transition-colors uppercase tracking-wider">{currentT.income}</span>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => setActiveView("schemes")}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-400/50 transition-all">
                                    <ScrollText size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-neon-400 transition-colors uppercase tracking-wider">{currentT.schemes}</span>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => setActiveView("advice")}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-400/50 transition-all">
                                    <Lightbulb size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-neon-400 transition-colors uppercase tracking-wider">{currentT.advice}</span>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => setActiveView("net-monitor")}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-sea-500/50 transition-all">
                                    <Anchor size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-sea-300 transition-colors uppercase tracking-wider">{currentT.net_monitor}</span>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => setActiveView("profile")}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-400/50 transition-all">
                                    <User size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-neon-400 transition-colors uppercase tracking-wider">{currentT.profile}</span>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => setActiveView("listings")}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-400/50 transition-all">
                                    <LayoutList size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-neon-400 transition-colors uppercase tracking-wider">{currentT.listings}</span>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-neon-400/30 hover:scale-105 hover:shadow-neon-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => window.dispatchEvent(new CustomEvent('ai:open'))}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-400/50 transition-all">
                                    <Bot size={36} className="text-neon-400 drop-shadow-[0_0_10px_rgba(0,245,255,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-neon-400 transition-colors uppercase tracking-wider text-center">AI Assistant</span>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-neon-400/30 hover:scale-105 hover:shadow-neon-400/50 transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard/hardware')}>
                                <div className="bg-ocean-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-neon-400/50 transition-all">
                                    <BarChart3 size={36} className="text-neon-400 drop-shadow-[0_0_10px_rgba(0,245,255,0.7)]" />
                                </div>
                                <span className="text-sm font-semibold text-white tracking-wide group-hover:text-neon-400 transition-colors uppercase tracking-wider text-center">Hardware Sensors</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === "listings" && (
                    <div className="animate-fade-in px-4">
                        <header className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActiveView('home')} className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-semibold text-white tracking-wide uppercase">My Fish Listings</h2>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myListings.length === 0 ? (
                                <div className="col-span-full rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 p-12 text-center text-white/50">
                                    <Fish size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-semibold tracking-wide">No listings found. Start by uploading one!</p>
                                </div>
                            ) : (
                                myListings.map((listing) => (
                                    <div key={listing._id} className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 overflow-hidden flex group transition-all hover:bg-white/15">
                                        <div className="w-32 h-32 bg-ocean-800/50 flex items-center justify-center border-r border-white/5 overflow-hidden">
                                            {listing.imageUrl ? (
                                                <img src={`${API_BASE_URL.replace('/api', '')}${listing.imageUrl}`} alt={listing.fishType} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            ) : <Fish size={32} className="opacity-20" />}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-white tracking-wide text-lg">{listing.fishType}</h3>
                                                    <div className="flex items-center gap-1">
                                                        {listing.status === 'in_stock' ? (
                                                            <PackageCheck size={14} className="text-green-400" />
                                                        ) : (
                                                            <PackageX size={14} className="text-red-400" />
                                                        )}
                                                        <span className={`text-[10px] font-bold uppercase ${listing.status === 'in_stock' ? 'text-green-400' : 'text-red-400'}`}>
                                                            {listing.status === 'in_stock' ? 'In Stock' : 'Stock Out'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-white/50 font-semibold tracking-wide">{listing.quantity}kg • ₹{listing.pricePerKg}/kg</div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    onClick={() => handleUpdateStockStatus(listing._id, listing.status)}
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border ${listing.status === 'in_stock' ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'}`}
                                                >
                                                    {listing.status === 'in_stock' ? 'Mark Sold Out' : 'Mark In Stock'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteListing(listing._id)}
                                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeView === "upload" && (
                    <div className="animate-fade-in px-4">
                        <header className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => setActiveView('home')}
                                className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-semibold text-white tracking-wide uppercase">Upload New Listing</h2>
                        </header>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!selectedImage) return alert('Please upload an image');
                            const formElement = e.target as HTMLFormElement;
                            const formData = new FormData(formElement);

                            if (fileInputRef.current?.files?.[0]) {
                                formData.delete('image');
                                formData.append('image', fileInputRef.current.files[0]);
                            }

                            try {
                                const token = localStorage.getItem('fisherDirectToken');
                                const res = await fetch(`${API_BASE_URL}/fish/upload`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: formData
                                });

                                if (res.ok) {
                                    alert('Fish uploaded successfully!');
                                    setActiveView('home');
                                    setSelectedImage(null);
                                    formElement.reset();
                                } else {
                                    const data = await res.json();
                                    alert('Upload failed: ' + data.message);
                                }
                            } catch (error) {
                                console.error(error);
                                alert('Error connecting to server');
                            }
                        }} className="glass-card p-8 bg-white/10 backdrop-blur border border-cyan-500/30">
                            <input
                                type="file"
                                name="image"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center border-2 border-dashed border-neon-400/50 rounded-2xl mb-8 bg-ocean-800/50 hover:bg-ocean-800/80 transition-colors cursor-pointer overflow-hidden relative ${selectedImage ? 'p-2' : 'p-12'}`}
                            >
                                {selectedImage ? (
                                    <>
                                        <img src={selectedImage} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
                                        <div className="absolute bottom-4 bg-neon-400 text-ocean-900 px-3 py-1 rounded font-bold text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,245,255,0.5)] transition-all hover:scale-105">CHANGE PHOTO</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-white/5 p-6 rounded-full mb-4">
                                            <Plus size={48} className="text-neon-400 drop-shadow-[0_0_10px_rgba(0,245,255,0.6)]" />
                                        </div>
                                        <span className="text-sm font-semibold text-white/70 uppercase tracking-widest">Select Fish Image</span>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col gap-6">
                                <div>
                                    <label className="text-xs font-bold text-white/50 tracking-widest uppercase mb-2 block">Fish Type</label>
                                    <select name="fishType" className="input-glass" required>
                                        <option value="Seer Fish">Seer Fish</option>
                                        <option value="Mackerel">Mackerel</option>
                                        <option value="Tuna">Tuna</option>
                                        <option value="Snapper">Snapper</option>
                                        <option value="Pomfret">Pomfret</option>
                                        <option value="Prawns">Prawns</option>
                                    </select>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-white/50 tracking-widest uppercase mb-2 block">Quantity (kg)</label>
                                        <input type="number" name="quantity" min="1" placeholder="10" className="input-glass" required />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-white/50 tracking-widest uppercase mb-2 block">Price per kg (₹)</label>
                                        <input type="number" name="pricePerKg" min="1" placeholder="500" className="input-glass" required />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-4 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all w-full mt-8 uppercase tracking-widest text-lg">
                                Submit Listing
                            </button>
                        </form>

                        {activeView === "upload" && (
                            // ... (I'll keep the previous upload content but update the bottom list)
                            // Wait, I need to make sure I don't overwrite the form restored in the previous step.
                            // I'll just target the "My Listings" section within upload view.
                            <div className="mt-12 px-4">
                                <h3 className="text-xl font-semibold text-white tracking-wide mb-6 uppercase">Recently Uploaded</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                                    {myListings.length === 0 ? (
                                        <div className="col-span-full rounded-xl bg-white/10 backdrop-blur border border-dashed border-white/20 p-8 text-center text-white/40">
                                            No fish listings yet.
                                        </div>
                                    ) : (
                                        myListings.map((listing) => (
                                            <div key={listing._id} className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 overflow-hidden flex flex-col group transition-all hover:bg-white/15">
                                                <div className="flex">
                                                    <div className="w-24 h-24 bg-ocean-800/50 flex items-center justify-center border-r border-white/5 shrink-0 overflow-hidden">
                                                        {listing.imageUrl ? (
                                                            <img src={`${API_BASE_URL.replace('/api', '')}${listing.imageUrl}`} alt={listing.fishType} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        ) : <Fish size={24} className="opacity-20" />}
                                                    </div>
                                                    <div className="p-4 flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-semibold text-white tracking-wide text-base">{listing.fishType}</h4>
                                                            <div className="flex items-center gap-1">
                                                                {listing.status === 'in_stock' ? <PackageCheck size={12} className="text-green-400" /> : <PackageX size={12} className="text-red-400" />}
                                                                <span className={`text-[9px] font-bold uppercase ${listing.status === 'in_stock' ? 'text-green-400' : 'text-red-400'}`}>
                                                                    {listing.status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-xl font-bold text-neon-400">₹{listing.pricePerKg}<span className="text-[10px] text-white/50 font-normal">/kg</span></div>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex justify-between items-center text-xs">
                                                    <div className="flex gap-4">
                                                        <div>
                                                            <div className="text-white/40 uppercase font-bold text-[8px] tracking-widest">Uploaded</div>
                                                            <div className="text-white font-semibold">{listing.totalQuantity || listing.quantity}kg</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-neon-400 uppercase font-bold text-[8px] tracking-widest">Remaining</div>
                                                            <div className="text-neon-400 font-bold">{listing.quantity}kg</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStockStatus(listing._id, listing.status)}
                                                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border ${listing.status === 'in_stock' ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'}`}
                                                        >
                                                            {listing.status === 'in_stock' ? 'Mark Sold' : 'Mark In Stock'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteListing(listing._id)}
                                                            className="bg-white/10 hover:bg-white/20 text-white/50 hover:text-white p-2 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeView === "orders" && (
                    <div className="animate-fade-in px-4">
                        <header className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActiveView('home')} className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-semibold text-white tracking-wide uppercase">My Orders</h2>
                        </header>

                        <div className="flex flex-col gap-6">
                            {orders.map((order) => (
                                <div key={order.id} className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 p-6 border-l-4 border-l-neon-400 group hover:-translate-y-1 transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-semibold text-white group-hover:text-neon-400 transition-colors uppercase tracking-wide">{order.customer}</span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${order.status === 'Completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-sea-500/20 text-sea-400 border border-sea-500/30'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 items-center mb-6">
                                        <div className="bg-ocean-800/80 p-3 rounded-xl border border-white/5 shadow-inner">
                                            <Fish size={24} className="text-cyan-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white/90">{order.items}</div>
                                            <div className="text-xs text-white/50 tracking-wide mt-1">Order ID: <span className="text-white/80">{order.id}</span> • {order.time}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                        <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">Total Amount:</span>
                                        <span className="text-xl font-bold text-neon-400 drop-shadow-sm">₹{order.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeView === "income" && (
                    <div className="animate-fade-in px-4">
                        <header className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActiveView('home')} className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-semibold text-white tracking-wide uppercase">Income Insights</h2>
                        </header>

                        <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 p-8 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 size={16} className="text-cyan-400" />
                                <div className="text-xs text-white/50 font-bold uppercase tracking-widest">Monthly Income</div>
                            </div>
                            <div className="flex items-end gap-3 h-32 mt-6">
                                <div className="bg-neon-400 w-8 h-[60%] rounded-t-sm shadow-[0_0_15px_rgba(0,245,255,0.4)] transition-all hover:scale-110"></div>
                                <div className="bg-sea-400 w-8 h-[80%] rounded-t-sm shadow-[0_0_15px_rgba(2,132,199,0.4)] transition-all hover:scale-110"></div>
                                <div className="bg-neon-400 w-8 h-[40%] rounded-t-sm shadow-[0_0_15px_rgba(0,245,255,0.4)] transition-all hover:scale-110"></div>
                                <div className="bg-sea-400 w-8 h-[90%] rounded-t-sm shadow-[0_0_15px_rgba(2,132,199,0.4)] transition-all hover:scale-110"></div>
                                <div className="bg-neon-400 w-8 h-[70%] rounded-t-sm shadow-[0_0_15px_rgba(0,245,255,0.4)] transition-all hover:scale-110"></div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 p-8">
                            <div className="flex justify-between items-center text-white">
                                <div>
                                    <div className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Total Revenue</div>
                                    <div className="text-3xl font-bold tracking-wide drop-shadow-md">₹{revenue.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Profit Metric</div>
                                    <div className="text-3xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">{margin}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === "schemes" && (
                    <div className="animate-fade-in px-4">
                        <header className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActiveView('home')} className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-semibold text-white tracking-wide uppercase">Govt Schemes</h2>
                        </header>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 p-6 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(2,132,199,0.1)] group hover:bg-white/15 transition-all">
                                <div className="bg-ocean-800/50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <ScrollText size={32} className="text-cyan-400" />
                                </div>
                                <span className="font-semibold text-white mb-6 uppercase tracking-widest text-sm">PMMSY</span>
                                <button className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all w-full uppercase tracking-widest text-xs">APPLY</button>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 p-6 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.1)] group hover:bg-white/15 transition-all">
                                <div className="bg-ocean-800/50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <ScrollText size={32} className="text-green-400" />
                                </div>
                                <span className="font-semibold text-white mb-6 uppercase tracking-widest text-sm">KCC</span>
                                <button className="bg-green-500 hover:bg-green-400 text-white font-semibold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.6)] transition-all w-full uppercase tracking-widest text-xs">APPLY</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === "net-monitor" && (
                    <div className="animate-fade-in px-4">
                        <header className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActiveView('home')} className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-semibold text-white tracking-wide uppercase">Smart Net Monitor</h2>
                        </header>

                        <div className="rounded-xl bg-ocean-900/80 backdrop-blur border border-white/10 p-6 py-4 flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80] animate-pulse"></div>
                                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">System Active</span>
                            </div>
                            <span className="text-[10px] font-mono text-neon-400/80 bg-neon-400/10 px-3 py-1 rounded border border-neon-400/20">ID: NET-PRO-X1</span>
                        </div>

                        <div className="glass-card p-8 text-center bg-ocean-800/40 relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-neon-400 to-transparent opacity-50"></div>
                            <div className="text-sm text-neon-400 font-bold tracking-widest mb-4 uppercase">CURRENT NET LOAD</div>

                            {isManualMode ? (
                                <div className="my-8 flex justify-center items-center gap-4">
                                    <input
                                        type="number"
                                        value={netLoad}
                                        onChange={(e) => updateManualLoad(Number(e.target.value))}
                                        className="input-glass !w-48 !text-6xl !font-black !text-center !py-4 text-white"
                                    />
                                    <span className="text-4xl text-white/50 font-bold">kg</span>
                                </div>
                            ) : (
                                <div className={`text-7xl font-black drop-shadow-lg my-8 ${netStatus === 'STOP' ? 'text-red-500 [text-shadow:0_0_20px_rgba(239,68,68,0.5)]' : 'text-white'}`}>
                                    {netLoad}<span className="text-3xl text-white/50 ml-2 font-bold">kg</span>
                                </div>
                            )}

                            <div className="flex justify-center mb-10">
                                <button
                                    onClick={() => setIsManualMode(!isManualMode)}
                                    className={`px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,245,255,0.2)] hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] ${isManualMode ? 'bg-cyan-500 text-white' : 'bg-transparent text-white/70 border border-white/20 hover:border-white/50 hover:text-white'
                                        }`}
                                >
                                    {isManualMode ? 'Resume Live Stream' : 'Manual Override'}
                                </button>
                            </div>

                            <div className="bg-ocean-900/50 border border-white/5 p-6 rounded-2xl mb-8">
                                <div className="flex justify-between mb-3">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">STRESS INTENSITY</span>
                                    <span className={`text-xs font-black uppercase tracking-widest ${netLoad >= 50 ? 'text-red-500' : 'text-yellow-400'}`}>{getStressLevel(netLoad)}</span>
                                </div>
                                <div className="h-4 bg-ocean-950 rounded-full overflow-hidden shadow-inner border border-white/5 relative">
                                    <div className="absolute inset-0 bg-white/5 w-full h-full strip-pattern opacity-50"></div>
                                    <div
                                        className={`h-full transition-all duration-500 relative ${netLoad >= 50 ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : netLoad >= 30 ? 'bg-yellow-500 shadow-[0_0_15px_#eab308]' : 'bg-green-500 shadow-[0_0_15px_#22c55e]'}`}
                                        style={{ width: `${(Math.min(netLoad, 80) / 80) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => setActiveIssue('TANGLE')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeIssue === 'TANGLE' ? 'bg-yellow-500 text-ocean-900 shadow-[0_0_15px_#eab308]' : 'bg-ocean-800/50 text-white/50 hover:text-white hover:bg-ocean-700/50 border border-white/10'}`}
                                >
                                    🌀 TANGLE
                                </button>
                                <button
                                    onClick={() => setActiveIssue('TEAR')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeIssue === 'TEAR' ? 'bg-red-500 text-white shadow-[0_0_15px_#ef4444]' : 'bg-ocean-800/50 text-white/50 hover:text-white hover:bg-ocean-700/50 border border-white/10'}`}
                                >
                                    ❌ TEAR
                                </button>
                                <button
                                    onClick={() => setActiveIssue('NONE')}
                                    className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all bg-ocean-900 text-white/50 hover:text-white border border-white/5"
                                >
                                    RESET
                                </button>
                            </div>

                            <div className={`p-6 rounded-2xl border-2 transition-colors ${(netStatus === 'STOP' || activeIssue !== 'NONE')
                                ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse'
                                : 'bg-green-500/20 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]'
                                }`}>
                                <div className={`text-2xl font-bold uppercase tracking-widest ${(netStatus === 'STOP' || activeIssue !== 'NONE') ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                    {(netStatus === 'STOP' || activeIssue !== 'NONE') ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <ShieldAlert size={28} />
                                            <span>{activeIssue !== 'NONE' ? activeIssue : 'STOP'}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-white">
                                            <Anchor size={28} className="text-green-400" />
                                            <span>SAFE TO PULL</span>
                                        </div>
                                    )}
                                </div>
                                {(netStatus === 'STOP' || activeIssue !== 'NONE') && (
                                    <p className="m-0 mt-3 text-xs font-semibold text-red-300 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                                        {activeIssue === 'TANGLE' ? 'Entanglement detected - back down vessel!' :
                                            activeIssue === 'TEAR' ? 'Net tearing detected - haul in immediately!' :
                                                'Load exceeds 50kg - stop motor immediately!'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-6">
                            <div className="glass-card p-6 border-white/5 hover:border-neon-400/30 transition-colors">
                                <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">Peak Load Today</div>
                                <div className="text-3xl font-bold text-white drop-shadow-sm">54 <span className="text-xl text-white/50">kg</span></div>
                            </div>
                            <div className="glass-card p-6 border-white/5 hover:border-sea-400/30 transition-colors">
                                <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-2">Pulling Duration</div>
                                <div className="text-3xl font-bold text-white drop-shadow-sm">12 <span className="text-xl text-white/50">min</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === "advice" && (
                    <div className="animate-fade-in px-4">
                        <header className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActiveView('home')} className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-semibold text-white tracking-wide uppercase">Today's Advice</h2>
                        </header>

                        <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 p-10 text-center relative overflow-hidden group transition-all hover:bg-white/15">
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-400/10 rounded-full blur-3xl group-hover:bg-neon-400/20 transition-all"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-sea-500/10 rounded-full blur-3xl group-hover:bg-sea-500/20 transition-all"></div>

                            <div className="bg-ocean-800/50 p-6 rounded-full inline-block mb-6 shadow-neon-glow-sm group-hover:scale-110 group-hover:shadow-neon-glow-lg transition-all">
                                <Lightbulb size={64} className="text-neon-400 drop-shadow-[0_0_15px_rgba(0,245,255,0.4)]" />
                            </div>
                            <p className="text-xl font-semibold text-white leading-relaxed mb-10 max-w-lg mx-auto tracking-wide">
                                {getAdviceSummary()}
                            </p>

                            <div className="h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full my-8 relative max-w-lg mx-auto shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <div className="absolute -top-4 w-8 h-8 flex items-center justify-center text-xl transition-all duration-1000 animate-bounce" style={{ left: weather === 'Stormy' ? '90%' : '20%' }}>📍</div>
                            </div>

                            <div className="flex justify-between text-xs font-bold text-white/50 tracking-widest max-w-lg mx-auto">
                                <span>LOW RISK</span>
                                <span>HIGH RISK</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === "profile" && (
                    <div className="animate-fade-in px-4">
                        <header className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActiveView('home')} className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-semibold text-white tracking-wide uppercase">My Profile</h2>
                        </header>
                        <div className="rounded-xl bg-white/10 backdrop-blur border border-cyan-500/30 p-8 text-center">
                            <div className="w-24 h-24 bg-ocean-800 rounded-full mx-auto mb-6 border-2 border-neon-400 flex items-center justify-center overflow-hidden">
                                <User size={48} className="text-neon-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Fisherman Dashboard</h3>
                            <p className="text-white/50 text-sm mb-8 uppercase tracking-widest">Certified Member Since 2024</p>
                            <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold px-6 py-3 rounded-lg transition-all w-full uppercase tracking-widest text-xs">Log Out</button>
                        </div>
                    </div>
                )}
            </main>

            {/* ---------- BOTTOM NAV ---------- */}
            <nav className="fixed bottom-0 left-0 right-0 glass-nav h-20 flex justify-around items-center border-t border-white/10 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-[100] pb-2 sm:pb-0">
                <div className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeView === 'home' ? 'text-neon-400 scale-110' : 'text-white/50 hover:text-white/80'}`} onClick={() => setActiveView('home')}>
                    <Home size={24} className={activeView === 'home' ? 'drop-shadow-[0_0_8px_#00f5ff]' : ''} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Home</span>
                </div>
                <div className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeView === 'upload' ? 'text-neon-400 scale-110' : 'text-white/50 hover:text-white/80'}`} onClick={() => setActiveView('upload')}>
                    <Plus size={24} className={activeView === 'upload' ? 'drop-shadow-[0_0_8px_#00f5ff]' : ''} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Upload</span>
                </div>
                <div className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeView === 'orders' ? 'text-neon-400 scale-110' : 'text-white/50 hover:text-white/80'}`} onClick={() => setActiveView('orders')}>
                    <ClipboardList size={24} className={activeView === 'orders' ? 'drop-shadow-[0_0_8px_#00f5ff]' : ''} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Orders</span>
                </div>
                <div className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeView === 'income' ? 'text-neon-400 scale-110' : 'text-white/50 hover:text-white/80'}`} onClick={() => setActiveView('income')}>
                    <BarChart3 size={24} className={activeView === 'income' ? 'drop-shadow-[0_0_8px_#00f5ff]' : ''} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Income</span>
                </div>
                <div className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeView === 'schemes' ? 'text-neon-400 scale-110' : 'text-white/50 hover:text-white/80'}`} onClick={() => setActiveView('schemes')}>
                    <ScrollText size={24} className={activeView === 'schemes' ? 'drop-shadow-[0_0_8px_#00f5ff]' : ''} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Schemes</span>
                </div>
                <div className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeView === 'profile' ? 'text-neon-400 scale-110' : 'text-white/50 hover:text-white/80'}`} onClick={() => setActiveView('profile')}>
                    <User size={24} className={activeView === 'profile' ? 'drop-shadow-[0_0_8px_#00f5ff]' : ''} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Profile</span>
                </div>
            </nav>
        </div>
    );
};

export default FishermanDashboard;
