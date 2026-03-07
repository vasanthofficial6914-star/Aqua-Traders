import { useState, useEffect, useRef } from 'react';

interface HardwareData {
    weight: number;
    temperature: number;
    salinity: number;
    timestamp: number;
    alert?: boolean;
    stress: "NORMAL" | "HIGH";
}

export const useHardwareWeight = () => {
    const [data, setData] = useState<HardwareData | null>(null);
    const [isOffline, setIsOffline] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<any>(null);
    const isUnmounting = useRef(false);

    const connect = () => {
        if (isUnmounting.current) return;

        if (wsRef.current) {
            if (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN) {
                return;
            }
            wsRef.current.onclose = null;
            wsRef.current.close();
            wsRef.current = null;
        }

        const wsUrl = 'ws://localhost:5001/hardware';

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                if (isUnmounting.current) {
                    ws.close();
                    return;
                }
                setIsOffline(false);
            };

            ws.onmessage = (event) => {
                if (isUnmounting.current) return;
                try {
                    const parsed = JSON.parse(event.data);

                    // Logic to determine stress if not provided by server
                    // Requirement: Ensure stress value comes from hardware WebSocket
                    // If the server doesn't send "stress", we can map it from alert or thresholds
                    const stressValue = parsed.stress || (
                        (parsed.weight > 50 || parsed.temperature > 35 || parsed.salinity > 40 || parsed.alert)
                            ? "HIGH"
                            : "NORMAL"
                    );

                    setData({
                        weight: parsed.weight ?? 0,
                        temperature: parsed.temperature ?? 0,
                        salinity: parsed.salinity ?? 0,
                        timestamp: parsed.timestamp ?? Date.now(),
                        alert: parsed.alert,
                        stress: stressValue
                    });
                    setIsOffline(false);
                } catch (err) {
                    console.error("Error parsing hardware data:", err);
                }
            };

            ws.onclose = () => {
                if (isUnmounting.current) return;
                setIsOffline(true);
                wsRef.current = null;
                if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = setTimeout(() => {
                    if (!isUnmounting.current) connect();
                }, 5000);
            };

            ws.onerror = () => {
                setIsOffline(true);
            };
        } catch (err) {
            setIsOffline(true);
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = setTimeout(connect, 5000);
        }
    };

    useEffect(() => {
        isUnmounting.current = false;
        connect();

        return () => {
            isUnmounting.current = true;
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, []);

    return { data, isOffline, weight: data?.weight ?? null, stress: data?.stress ?? "NORMAL" };
};
