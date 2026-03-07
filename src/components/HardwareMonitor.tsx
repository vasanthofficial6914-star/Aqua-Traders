import React, { useState, useEffect, useRef } from 'react';
import { useHardwareWeight } from '../hooks/useHardwareWeight';
import { Scale, Thermometer, Droplets, AlertTriangle, BellRing, Clock, ShieldCheck } from 'lucide-react';

const HardwareMonitor: React.FC = () => {
    // Stress value is provided by the custom hook connected to the hardware WebSocket
    const { data, isOffline, stress } = useHardwareWeight();

    // 1. Single audio instance reference
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 2. Initialize the audio once on component mount
    useEffect(() => {
        audioRef.current = new Audio("/alert-beep.mp3");
        audioRef.current.loop = true; // Alarm should loop during high stress

        // Browser Autoplay workaround: requires a user click to enable audio
        const unlockAudio = () => {
            if (audioRef.current) {
                audioRef.current.play().then(() => {
                    audioRef.current?.pause();
                }).catch(() => { });
            }
        };
        document.addEventListener("click", unlockAudio, { once: true });

        return () => {
            document.removeEventListener("click", unlockAudio);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // 3. Handle stress changes inside ONE useEffect
    useEffect(() => {
        if (!audioRef.current) return;

        if (stress === "HIGH") {
            console.log("Stress HIGH → play sound");
            // Only start if not already playing to prevent restart glitches
            if (audioRef.current.paused) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(err => console.log("Audio play blocked:", err));
            }
        }

        if (stress === "NORMAL") {
            console.log("Stress NORMAL → stop sound");
            // Immediately stop and reset the sound
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [stress]);

    const StatCard = ({ icon: Icon, title, value, unit, isAlert, colorClass }: any) => (
        <div className={`glass-card p-6 flex flex-col items-center gap-4 transition-all duration-500 border-2 
            ${isAlert ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse' : 'border-white/10 bg-ocean-800/20'}`}>
            <div className={`p-4 rounded-full ${isAlert ? 'bg-red-500 text-white' : colorClass}`}>
                <Icon size={32} />
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">{title}</p>
                <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-black ${isAlert ? 'text-red-500' : 'text-white'}`}>
                        {value !== null && value !== undefined ? value : '--'}
                    </span>
                    <span className="text-xs font-bold opacity-30">{unit}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-8 animate-fade-in relative z-10">
            {/* ALERT BANNER */}
            {stress === "HIGH" && (
                <div className="bg-red-600 p-4 rounded-2xl flex items-center justify-center gap-4 text-white shadow-[0_0_40px_rgba(220,38,38,0.5)] border-2 border-white/30 animate-bounce">
                    <BellRing className="w-8 h-8 animate-pulse text-white" />
                    <span className="font-black uppercase tracking-tighter text-lg drop-shadow-lg">
                        CRITICAL STRESS: ALERT SOUND ACTIVE
                    </span>
                </div>
            )}

            {/* CONNECTION BAR */}
            <div className="flex justify-between items-center bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_15px_#22c55e]'}`} />
                    <span className="text-xs font-black uppercase tracking-widest">{isOffline ? 'Searching for Hardware...' : 'Vessel Uplink Stable'}</span>
                </div>
                {isOffline && (
                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase animate-pulse">
                        <AlertTriangle size={14} /> Link Failure
                    </div>
                )}
            </div>

            {/* SENSOR DATA CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    icon={Scale}
                    title="Structural Load"
                    value={data?.weight?.toFixed(2)}
                    unit="kg"
                    isAlert={data && data.weight > 50}
                    colorClass="bg-blue-500/20 text-blue-400"
                />
                <StatCard
                    icon={Thermometer}
                    title="Internal Thermal"
                    value={data?.temperature}
                    unit="°C"
                    isAlert={data && data.temperature > 35}
                    colorClass="bg-orange-500/20 text-orange-400"
                />
                <StatCard
                    icon={Droplets}
                    title="Fluid Salinity"
                    value={data?.salinity}
                    unit="ppt"
                    isAlert={data && data.salinity > 40}
                    colorClass="bg-cyan-500/20 text-cyan-400"
                />
            </div>

            {/* SYSTEM LOGS */}
            <div className="bg-black/90 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Telemetry Debug Stream</span>
                    <ShieldCheck size={14} className="text-green-500/40" />
                </div>
                <div className="p-6 font-mono text-[10px] text-neon-400/70 h-40 overflow-y-auto space-y-2">
                    <p className="opacity-40">{`> Authenticating hardware handshake...`}</p>
                    {data && (
                        <p className="text-white/80 transition-all border-l-2 border-neon-400 pl-3">{`> [PACKET_RECV] ${JSON.stringify(data)}`}</p>
                    )}
                    {stress === "HIGH" && (
                        <p className="text-red-500 font-bold animate-pulse">{`> [SYSTEM_CRITICAL] Threshold overflow detected at ${new Date().toLocaleTimeString()}`}</p>
                    )}
                    {stress === "NORMAL" && <p className="text-green-500/40">{`> [SYSTEM_IDLE] Environment parameters stable`}</p>}
                </div>
            </div>
        </div>
    );
};

export default HardwareMonitor;
