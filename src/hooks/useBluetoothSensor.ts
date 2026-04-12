import { useState, useCallback, useRef } from 'react';

export interface BluetoothData {
  weight: number | null;
  status: 'SAFE' | 'WARNING' | 'OVERLOAD';
  stress: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const useBluetoothSensor = () => {
  const [data, setData] = useState<BluetoothData>({
    weight: null,
    status: 'SAFE',
    stress: 'LOW'
  });
  const [isOffline, setIsOffline] = useState(true);
  const deviceRef = useRef<BluetoothDevice | null>(null);

  const connect = useCallback(async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb', '0000ffe1-0000-1000-8000-00805f9b34fb'] 
      });
      
      device.addEventListener('gattserverdisconnected', () => {
        setIsOffline(true);
        setData(prev => ({ ...prev, weight: null, status: 'SAFE', stress: 'LOW' }));
      });

      const server = await device.gatt?.connect();
      if (!server) throw new Error("Could not connect to GATT server");

      const services = await server.getPrimaryServices();
      let notifyCharacteristic = null;

      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.notify || char.properties.indicate) {
            notifyCharacteristic = char;
            break;
          }
        }
        if (notifyCharacteristic) break;
      }

      if (notifyCharacteristic) {
        await notifyCharacteristic.startNotifications();
        let buffer = '';
        
        notifyCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          const value = event.target.value;
          const text = new TextDecoder().decode(value);
          buffer += text;
          
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.substring(0, newlineIndex).trim();
            buffer = buffer.substring(newlineIndex + 1);
            
            if (line.length > 0) {
              parseDataLine(line);
            }
          }
        });
        
        deviceRef.current = device;
        setIsOffline(false);
      } else {
        console.error("No notify characteristic found");
        alert("Selected device does not support notifications.");
      }
    } catch (error) {
      console.error("Bluetooth Connection Error:", error);
    }
  }, []);

  const parseDataLine = (line: string) => {
    setData(prev => {
      let newWeight = prev.weight;
      let newStatus = prev.status;
      let newStress = prev.stress;

      if (line.startsWith('LOAD:')) {
        const valStr = line.replace('LOAD:', '').trim();
        const val = parseFloat(valStr);
        if (!isNaN(val)) {
          newWeight = val;
          
          // Apply status rules
          if (newWeight < 40) {
            newStatus = 'SAFE';
          } else if (newWeight < 50) {
            newStatus = 'WARNING';
          } else {
            newStatus = 'OVERLOAD';
          }

          // Apply stress rules
          if (newWeight < 20) {
            newStress = 'LOW';
          } else if (newWeight < 50) {
            newStress = 'MEDIUM';
          } else {
            newStress = 'HIGH';
          }
        }
      } else if (line.startsWith('STATUS:')) {
        // If string status comes explicitly, we can also use it
        const val = line.replace('STATUS:', '').trim();
        if (val === 'SAFE' || val === 'WARNING' || val === 'OVERLOAD') {
          newStatus = val;
        }
      }

      return { weight: newWeight, status: newStatus, stress: newStress };
    });
  };

  const disconnect = useCallback(() => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
  }, []);

  return { data, isOffline, connect, disconnect };
};
