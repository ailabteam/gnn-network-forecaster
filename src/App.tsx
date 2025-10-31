// src/App.tsx

import { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import { Node, useNodesState } from 'reactflow';
import './App.css';

// --- Định nghĩa các hằng số ---
const NODE_NAMES = ['GEO_1', 'GS_Frankfurt', 'GS_Hanoi', 'GS_NewYork', 'GS_Singapore', 'LEO_1', 'LEO_2', 'LEO_3'];
const SEQUENCE_LENGTH = 10;
const STATUS_COLORS = { normal: '#89CFF0', warning: '#FFD700', anomaly: '#FF6347' };

const initialPositions: Record<string, { x: number, y: number }> = {
    LEO_1: { x: 100, y: 100 }, LEO_2: { x: 300, y: 0 }, LEO_3: { x: 500, y: 100 },
    GEO_1: { x: 300, y: 200 }, GS_Hanoi: { x: 0, y: 400 }, GS_Frankfurt: { x: 200, y: 400 },
    GS_NewYork: { x: 400, y: 400 }, GS_Singapore: { x: 600, y: 400 },
};

const initialNodes: Node[] = NODE_NAMES.map(name => ({
    id: name,
    position: initialPositions[name],
    data: { label: name },
    style: { backgroundColor: STATUS_COLORS.normal, border: '1px solid black', transition: 'background-color 0.5s ease' },
}));

// --- Các hàm tạo snapshot ---
const createNormalSnapshot = () => {
    const nodes = NODE_NAMES.map(name => ({ name, load: 0.2, queue_size: 15 }));
    const edges = [{"source": "LEO_1", "target": "LEO_2", "latency": 5.0, "bandwidth": 0.4}, {"source": "LEO_1", "target": "GS_Hanoi", "latency": 10.0, "bandwidth": 0.6}, {"source": "GS_NewYork", "target": "GEO_1", "latency": 70.0, "bandwidth": 0.3}];
    return { nodes, edges };
};

const createAnomalousSnapshot = (targetNode: string, intensity: number) => {
    const nodes = NODE_NAMES.map(name => {
      if (name === targetNode) {
        const anomalousLoad = 0.3 + (0.95 - 0.3) * intensity;
        const anomalousQueue = 20 + (95 - 20) * intensity;
        return { name, load: anomalousLoad, queue_size: anomalousQueue };
      }
      return { name, load: 0.2, queue_size: 15 };
    });
    const edges = [{"source": "LEO_1", "target": "LEO_2", "latency": 5.0, "bandwidth": 0.4}, {"source": "LEO_1", "target": "GS_Hanoi", "latency": 10.0, "bandwidth": 0.6}, {"source": "GS_NewYork", "target": "GEO_1", "latency": 70.0, "bandwidth": 0.3}];
    return { nodes, edges };
};


// --- Component Chính ---
function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [systemRisk, setSystemRisk] = useState(0);
    const [anomalyTarget, setAnomalyTarget] = useState<string | null>(null);
    const [intensity, setIntensity] = useState(1.0);
    const [apiStatus, setApiStatus] = useState('Idle');
  
    // Hook để gọi API
    useEffect(() => {
      console.log(`Effect Triggered: Target='${anomalyTarget}', Intensity=${intensity}`);
      
      const intervalId = setInterval(() => {
        setApiStatus('Calling API...');
        
        // Sửa lỗi `Array.fill()` bằng `Array.from()`
        let sequence;
        if (anomalyTarget) {
            console.log(`Generating ANOMALOUS sequence for target '${anomalyTarget}' with intensity ${intensity}`);
            const normalPart = Array.from({ length: 5 }, createNormalSnapshot);
            const anomalousPart = Array.from({ length: 5 }, () => createAnomalousSnapshot(anomalyTarget, intensity));
            sequence = [...normalPart, ...anomalousPart];
        } else {
            console.log("Generating NORMAL sequence.");
            sequence = Array.from({ length: SEQUENCE_LENGTH }, createNormalSnapshot);
        }
        
        // Log dữ liệu sẽ gửi đi để debug
        console.log("Payload to be sent:", { sequence });

        fetch('/api/forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sequence }) })
        .then(res => {
            if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
            return res.json();
        })
        .then(data => { 
            console.log("API Response:", data); // Log kết quả trả về
            setSystemRisk(data.anomaly_probability); 
            setApiStatus('Success'); 
        })
        .catch(err => { 
            console.error("API call failed:", err); 
            setApiStatus('Failed'); 
        });
      }, 3000);

      // Dọn dẹp interval khi component unmount hoặc khi dependency thay đổi
      return () => {
        console.log("Cleaning up interval.");
        clearInterval(intervalId);
      };
    }, [anomalyTarget, intensity]); // Chỉ chạy lại khi target hoặc intensity thay đổi

    // Hook để cập nhật màu sắc
    useEffect(() => {
        console.log(`Updating colors: Target='${anomalyTarget}', Risk=${systemRisk}`);
        setNodes((currentNodes) =>
          currentNodes.map((node) => {
            let color = STATUS_COLORS.normal;
            if (node.id === anomalyTarget && systemRisk > 0.5) {
              color = systemRisk > 0.8 ? STATUS_COLORS.anomaly : STATUS_COLORS.warning;
            }

            // Tạo object mới để đảm bảo render lại
            return {
              ...node,
              style: {
                ...node.style,
                backgroundColor: color,
                border: anomalyTarget === node.id ? '3px solid red' : '1px solid black',
                color: (node.id === anomalyTarget && systemRisk > 0.5) ? 'white' : 'black',
                fontWeight: (node.id === anomalyTarget && systemRisk > 0.5) ? 'bold' : 'normal',
              },
            };
          })
        );
      }, [systemRisk, anomalyTarget, setNodes]);
  
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>GNN Anomaly Forecaster - PoC #2</h1>
          <div className="controls">
            <div className="control-group">
              <label htmlFor="anomaly-target">Inject Anomaly on: </label>
              <select id="anomaly-target" onChange={(e) => {
                  const newTarget = e.target.value || null;
                  console.log(`User selected new target: ${newTarget}`);
                  setAnomalyTarget(newTarget);
                  setSystemRisk(0);
              }} value={anomalyTarget || ''}>
                <option value="">-- No Anomaly --</option>
                {NODE_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            {anomalyTarget && (
              <div className="control-group">
                <label htmlFor="intensity">Intensity ({intensity.toFixed(2)}): </label>
                <input id="intensity" type="range" min="0" max="1" step="0.05" value={intensity} 
                       onChange={(e) => setIntensity(parseFloat(e.target.value))} />
              </div>
            )}
            <div className="status-indicator">
              API Status: {apiStatus} | System Anomaly Probability: <strong>{systemRisk.toFixed(4)}</strong>
            </div>
          </div>
        </header>
        <main className="app-main">
          <NetworkGraph nodes={nodes} onNodesChange={onNodesChange} />
        </main>
      </div>
    );
}

export default App;
