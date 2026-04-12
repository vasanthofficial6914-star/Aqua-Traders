import { useState, useRef, useEffect, useCallback } from 'react';

interface SerialData {
    weight: number | null;
    status: 'SAFE' | 'WARNING' | 'OVERLOAD' | 'TANGLE' | 'TEAR';
    stress: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const useArduinoSerial = () => {
    const [weight, setWeight] = useState<number | null>(null);
    const [status, setStatus] = useState<SerialData['status']>('SAFE');
    const [stress, setStress] = useState<SerialData['stress']>('LOW');
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const portRef = useRef<any>(null);
    const readerRef = useRef<any>(null);
    const keepReadingRef = useRef(true);

    const getStressLevel = (load: number): SerialData['stress'] => {
        if (load < 20) return "LOW";
        if (load < 50) return "MEDIUM";
        return "HIGH";
    };

    const disconnect = useCallback(async () => {
        keepReadingRef.current = false;
        if (readerRef.current) {
            try {
                await readerRef.current.cancel();
            } catch (e) {
                console.error(e);
            }
        }
        if (portRef.current) {
            try {
                await portRef.current.close();
            } catch (e) {
                console.error(e);
            }
        }
        portRef.current = null;
        readerRef.current = null;
        setIsConnected(false);
        setWeight(null);
        setStatus('SAFE');
        setStress('LOW');
    }, []);

    const connect = async () => {
        if (!('serial' in navigator)) {
            const msg = 'Web Serial API is not supported in this browser. Please use Chrome or Edge.';
            setError(msg);
            alert(msg);
            return;
        }

        if (isConnected) {
            return; // Already connected
        }

        try {
            const serial = (navigator as any).serial;
            const port = await serial.requestPort();
            await port.open({ baudRate: 9600 });
            portRef.current = port;
            setIsConnected(true);
            setError(null);
            keepReadingRef.current = true;
            
            readLoop(port);

            port.addEventListener('disconnect', () => {
                disconnect();
            });

        } catch (err: any) {
            console.error('Failed to connect to serial port', err);
            setError(err.message || 'Failed to connect');
            setIsConnected(false);
        }
    };

    const readLoop = async (port: any) => {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        readerRef.current = reader;

        let buffer = '';

        try {
            while (keepReadingRef.current) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    buffer += value;
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep the incomplete line in buffer

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) continue;

                        // Parse weight: "Weight: 0.12 kg"
                        if (trimmedLine.startsWith('Weight:')) {
                            const match = trimmedLine.match(/Weight:\s*([\d.]+)\s*kg/i);
                            if (match && match[1]) {
                                const w = parseFloat(match[1]);
                                setWeight(w);
                                setStress(getStressLevel(w));
                            }
                        } 
                        // Parse status: "SAFE", "OVERLOAD", "WARNING", "TANGLE", "TEAR"
                        else if (['SAFE', 'OVERLOAD', 'WARNING', 'TANGLE', 'TEAR'].includes(trimmedLine)) {
                            setStatus(trimmedLine as SerialData['status']);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error reading continuous serial data:', error);
            disconnect();
        } finally {
            reader.releaseLock();
            await readableStreamClosed.catch(e => console.error("Stream close error", e));
        }
    };

    useEffect(() => {
        return () => {
            disconnect();
            // Remove event listeners logic could go here, but disconnect() handles it cleanly enough.
        };
    }, [disconnect]);

    return { weight, status, stress, isConnected, connect, disconnect, error };
};
