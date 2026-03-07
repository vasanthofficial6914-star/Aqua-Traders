import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHardwareWeight } from '../hooks/useHardwareWeight';
import { Scale, Thermometer, Droplets, Clock, AlertTriangle, ShieldCheck, ArrowLeft, BellRing } from 'lucide-react';

const HardwareDashboard: React.FC = () => {
    const { data, isOffline } = useHardwareWeight();
    const navigate = useNavigate();

    // Alert States
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [activeAlerts, setActiveAlerts] = useState({
        weight: false,
        temp: false,
        salt: false
    });

    // 1. Audio System Setup
    const audioRef = useRef(new Audio("/alert-beep.mp3"));

    // 2. Fix browser autoplay restriction
    useEffect(() => {
        const unlockAudio = () => {
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }).catch(err => console.log("Audio unlock failed:", err));
        };
        document.addEventListener("click", unlockAudio, { once: true });
        return () => document.removeEventListener("click", unlockAudio);
    }, []);

    // 3. Trigger sound and detection logic
    useEffect(() => {
        if (!data || isOffline) {
            setAlertMessage(null);
            setActiveAlerts({ weight: false, temp: false, salt: false });
            return;
        }

        const { weight, temperature, salinity, alert } = data;

        // Thresholds
        const weightAlert = weight > 50;
        const tempAlert = temperature > 35;
        const saltAlert = salinity > 40;

        const currentAlerts = {
            weight: weightAlert,
            temp: tempAlert,
            salt: saltAlert
        };

        // Determine if any alert is active
        const hasAnyAlert = alert === true || weightAlert || tempAlert || saltAlert;

        // Determine priority message
        let newMsg: string | null = null;
        if (weightAlert) newMsg = "⚠ Net Overload – Pull Net Immediately!";
        else if (tempAlert) newMsg = "⚠ Water Temperature Too High";
        else if (saltAlert) newMsg = "⚠ Salinity Level Critical";
        else if (alert) newMsg = "⚠ Hardware Alert Detected";

        // Only trigger if alert state changes (prevent multiple loops)
        if (hasAnyAlert && newMsg !== alertMessage) {
            console.log("Alert detected – playing sound.");
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => console.log("Play failed:", err));
        }

        setActiveAlerts(currentAlerts);
        setAlertMessage(newMsg);
    }, [data, isOffline, alertMessage]);


    const StatCard = ({ icon: Icon, title, value, unit, colorClass, isAlert }: any) => (
        <div className={`glass-card p-6 flex flex-col items-center justify-center space-y-4 hover:scale-105 transition-all duration-300 border-2 
            ${isAlert
                ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'border-white/5'}`}>
            <div className={`p-4 rounded-full bg-opacity-20 flex items-center justify-center 
                ${isAlert ? 'bg-red-500 animate-pulse' : colorClass}`}>
                <Icon className={`w-8 h-8 ${isAlert ? 'text-red-500' : colorClass.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-white/70 font-medium tracking-wider uppercase text-xs text-center">{title}</h3>
            <div className="flex items-baseline space-x-1">
                <span className={`text-4xl font-bold drop-shadow-md ${isAlert ? 'text-red-500' : 'text-white'}`}>
                    {value !== undefined ? value : '--'}
                </span>
                <span className={`text-lg font-medium ${isAlert ? 'text-red-400' : 'text-white/50'}`}>{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-[80vh] p-4 md:p-8 animate-fade-in relative" onClick={() => audioRef.current?.load()}>
            <div className="w-full">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-8 flex items-center gap-2 text-white/70 hover:text-neon-400 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
                </button>

                {/* VISUAL ALERT BANNER */}
                {alertMessage && (
                    <div className="mb-6 p-4 bg-red-600 rounded-xl flex items-center justify-center gap-4 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse border-2 border-white/20">
                        <BellRing className="w-6 h-6 animate-bounce" />
                        <span className="font-extrabold text-lg tracking-tight uppercase drop-shadow-md">{alertMessage}</span>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0 text-white">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 drop-shadow-lg">
                            <span className="text-neon-400">Integrated</span> Hardware Monitor
                        </h1>
                        <p className="text-white/60 mt-1">Real-time sensor telemetry from your connected vessel hardware.</p>
                    </div>

                    <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-inner">
                        <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}></div>
                        <span className="text-sm font-semibold tracking-wide uppercase">
                            {isOffline ? 'Hardware Offline' : 'Live Connection'}
                        </span>
                    </div>
                </div>

                {/* Connection Status Alert */}
                {isOffline && (
                    <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-4 text-red-200">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="font-bold uppercase text-xs tracking-widest">System Warning</p>
                            <p className="text-sm">Hardware server not detected. Please ensure your local hardware bridge is running and connected via Bluetooth/Serial.</p>
                        </div>
                    </div>
                )}

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={Scale}
                        title="Current Weight"
                        value={data?.weight?.toFixed(1)}
                        unit="KG"
                        colorClass="bg-blue-500"
                        isAlert={activeAlerts.weight}
                    />
                    <StatCard
                        icon={Thermometer}
                        title="Water Temperature"
                        value={data?.temperature}
                        unit="°C"
                        colorClass="bg-orange-500"
                        isAlert={activeAlerts.temp}
                    />
                    <StatCard
                        icon={Droplets}
                        title="Salinity Level"
                        value={data?.salinity}
                        unit="PPT"
                        colorClass="bg-cyan-500"
                        isAlert={activeAlerts.salt}
                    />
                </div>

                {/* Metadata section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Clock className="text-neon-400 w-6 h-6" />
                            <div>
                                <p className="text-white/50 text-xs uppercase font-bold tracking-widest">Last Synced At</p>
                                <p className="text-white font-mono">{data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'N/A'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/50 text-xs uppercase font-bold tracking-widest">Protocol</p>
                            <p className="text-neon-400 text-sm font-bold">WebSocket Secure</p>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="text-green-400 w-6 h-6" />
                            <div>
                                <p className="text-white/50 text-xs uppercase font-bold tracking-widest">System Integrity</p>
                                <p className="text-white font-medium">Telemetry Streams Stable</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all border border-white/5 uppercase tracking-tighter">
                            Calibrate
                        </button>
                    </div>
                </div>

                {/* Mini Raw Data Log */}
                <div className="mt-8 glass-card p-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-bold text-sm tracking-widest uppercase opacity-80">Telemetry Stream</h4>
                    </div>
                    <div className="bg-black/40 rounded p-4 font-mono text-[10px] text-neon-400/70 h-32 overflow-y-auto space-y-1">
                        <p>{`> [SYSTEM] Initializing stream...`}</p>
                        {data && (
                            <p className="text-white/80">{`> [DATA] Received: { weight: ${data.weight}kg, temp: ${data.temperature}C, salt: ${data.salinity}ppt }`}</p>
                        )}
                        {alertMessage && (
                            <p className="text-red-500 font-bold">{`> [ALERT] ${alertMessage.replace('⚠ ', '')} detected`}</p>
                        )}
                        {isOffline && <p className="text-red-400/80">{`> [ERROR] No active stream detected...`}</p>}
                        <p>{`> Listening on ws://localhost:5001/hardware...`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HardwareDashboard;
