// src/App.tsx

import { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import { Node } from 'reactflow';
import './App.css';

// --- Định nghĩa cấu trúc dữ liệu và các hằng số ---
const NODE_NAMES = ['GEO_1', 'GS_Frankfurt', 'GS_Hanoi', 'GS_NewYork', 'GS_Singapore', 'LEO_1', 'LEO_2', 'LEO_3'];
const SEQUENCE_LENGTH = 10;
const STATUS_COLORS = { normal: '#89CFF0', warning: '#FFD700', anomaly: '#FF6347' };

const generateMockSnapshot = (isAnomalous: boolean, targetNode: string | null) => {
  const nodes = NODE_NAMES.map(name => {
    let load = 0.1 + Math.random() * 0.2; // Tải bình thường < 30%
    let queue_size = 5 + Math.random() * 15;
    
    if (isAnomalous && name === targetNode) {
      load = 0.85 + Math.random() * 0.15; // Tải bất thường > 85%
      queue_size = 85 + Math.random() * 15;
    }
    return { name, load, queue_size };
  });
  const edges = [
    {"source": "LEO_1", "target": "LEO_2", "latency": 5.0, "bandwidth": 0.4},
    {"source": "LEO_1", "target": "GS_Hanoi", "latency": 10.0, "bandwidth": 0.6},
    {"source": "GS_NewYork", "target": "GEO_1", "latency": 70.0, "bandwidth": 0.3}
  ];
  return { nodes, edges };
};

// --- Component Chính ---
function App() {
  const [history, setHistory] = useState(() => Array(SEQUENCE_LENGTH).fill(generateMockSnapshot(false, null)));
  // SỬA LỖI 1: State mới để lưu trữ rủi ro toàn hệ thống
  const [systemRisk, setSystemRisk] = useState(0);
  const [anomalyTarget, setAnomalyTarget] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState('Idle');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setApiStatus('Calling API...');
      const newSnapshot = generateMockSnapshot(!!anomalyTarget, anomalyTarget);
      const newHistory = [...history.slice(1), newSnapshot];
      setHistory(newHistory);
      
      fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: newHistory }),
      })
      .then(res => {
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        // SỬA LỖI 2: Cập nhật state rủi ro hệ thống
        setSystemRisk(data.anomaly_probability);
        setApiStatus('Success');
      })
      .catch(err => {
        console.error("API call failed:", err);
        setApiStatus('Failed');
      });
    }, 3000);
    return () => clearInterval(intervalId);
  }, [history, anomalyTarget]); // Bỏ riskScores khỏi dependency array


  const initialPositions: Record<string, { x: number, y: number }> = {
    LEO_1: { x: 100, y: 100 }, LEO_2: { x: 300, y: 0 }, LEO_3: { x: 500, y: 100 },
    GEO_1: { x: 300, y: 200 }, GS_Hanoi: { x: 0, y: 400 }, GS_Frankfurt: { x: 200, y: 400 },
    GS_NewYork: { x: 400, y: 400 }, GS_Singapore: { x: 600, y: 400 },
  };

  // SỬA LỖI 3: Logic tô màu dựa trên rủi ro hệ thống và nút mục tiêu
  const graphNodes: Node[] = NODE_NAMES.map(name => {
    let color = STATUS_COLORS.normal;
    // Nếu nút này là mục tiêu của bất thường VÀ rủi ro hệ thống cao
    if (name === anomalyTarget && systemRisk > 0.5) {
      color = systemRisk > 0.8 ? STATUS_COLORS.anomaly : STATUS_COLORS.warning;
    }

    return {
      id: name,
      position: initialPositions[name],
      data: { label: name },
      style: { 
        backgroundColor: color, 
        border: anomalyTarget === name ? '3px solid red' : '1px solid black',
        transition: 'background-color 0.5s ease',
      },
    };
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GNN Anomaly Forecaster - PoC #2</h1>
        <div className="controls">
          <span>Inject Anomaly on: </span>
          <select onChange={(e) => {
              setAnomalyTarget(e.target.value || null);
              // Khi thay đổi target, reset rủi ro hệ thống để giao diện phản ứng nhanh hơn
              setSystemRisk(0);
          }} value={anomalyTarget || ''}>
            <option value="">-- No Anomaly --</option>
            {NODE_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <span className="status-indicator">
            API Status: {apiStatus} | System Anomaly Probability: <strong>{systemRisk.toFixed(4)}</strong>
          </span>
        </div>
      </header>
      <main className="app-main">
        <NetworkGraph nodes={graphNodes} />
      </main>
    </div>
  );
}

export default App;
