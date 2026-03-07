import { useState, useEffect, useRef } from 'react';

interface HardwareData {
    weight: number;
    temperature: number;
    salinity: number;
    timestamp: string | number;
}

export const useHardwareData = () => {
    const [data, setData] = useState<HardwareData | null>(null);
    const [isOffline, setIsOffline] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<any>(null);
    const hasUnmounted = useRef(false);

    const connect = () => {
        if (hasUnmounted.current) return;

        const wsUrl = 'ws://localhost:5001/hardware';

        if (socketRef.current) {
            if (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN) {
                return;
            }
            socketRef.current.onclose = null;
            socketRef.current.close();
            socketRef.current = null;
        }

        console.log('🔗 Connecting to hardware data stream...');

        try {
            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                console.log('✅ Connected to hardware server');
                setIsOffline(false);
                setError(null);
            };

            ws.onmessage = (event) => {
                if (hasUnmounted.current) return;
                try {
                    const parsedData = JSON.parse(event.data);
                    const normalized = {
                        weight: parsedData.weight ?? parsedData.value ?? 0,
                        temperature: parsedData.temperature ?? 0,
                        salinity: parsedData.salinity ?? 0,
                        timestamp: parsedData.timestamp ?? Date.now()
                    };
                    setData(normalized);
                } catch (err) {
                    // Silently ignore
                }
            };

            ws.onclose = () => {
                if (hasUnmounted.current) return;
                console.warn('🔌 Disconnected from hardware server');
                setIsOffline(true);
                socketRef.current = null;

                if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('🔄 Reconnecting to hardware data stream...');
                    connect();
                }, 5000);
            };

            ws.onerror = () => {
                setIsOffline(true);
            };
        } catch (err) {
            console.error('❌ Failed to connect hardware stream');
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
    };

    useEffect(() => {
        hasUnmounted.current = false;
        connect();

        return () => {
            console.log('🧹 Cleaning up hardware data connection...');
            hasUnmounted.current = true;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, []);

    return { data, isOffline, error };
};
