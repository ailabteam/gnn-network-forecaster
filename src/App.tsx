// src/App.tsx

import { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import { Node } from 'reactflow';
import './App.css';

// --- Định nghĩa cấu trúc dữ liệu và các hằng số ---
const NODE_NAMES = ['GEO_1', 'GS_Frankfurt', 'GS_Hanoi', 'GS_NewYork', 'GS_Singapore', 'LEO_1', 'LEO_2', 'LEO_3'];
const SEQUENCE_LENGTH = 10;
const STATUS_COLORS = { normal: '#89CFF0', warning: '#FFD700', anomaly: '#FF6347' };

// SỬA LỖI 1: TẠO RA CÁC MẪU DỮ LIỆU CỐ ĐỊNH

// Một mẫu snapshot "BÌNH THƯỜNG" điển hình
const createNormalSnapshot = () => {
  const nodes = NODE_NAMES.map(name => ({
    name,
    load: 0.2,
    queue_size: 15
  }));
  const edges = [
    {"source": "LEO_1", "target": "LEO_2", "latency": 5.0, "bandwidth": 0.4},
    {"source": "LEO_1", "target": "GS_Hanoi", "latency": 10.0, "bandwidth": 0.6},
    {"source": "GS_NewYork", "target": "GEO_1", "latency": 70.0, "bandwidth": 0.3}
  ];
  return { nodes, edges };
};

// Một mẫu snapshot "BẤT THƯỜNG" điển hình cho một nút cụ thể
const createAnomalousSnapshot = (targetNode: string) => {
  const nodes = NODE_NAMES.map(name => {
    if (name === targetNode) {
      return { name, load: 0.95, queue_size: 95 };
    }
    return { name, load: 0.2, queue_size: 15 };
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
  const [systemRisk, setSystemRisk] = useState(0);
  const [anomalyTarget, setAnomalyTarget] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState('Idle');
  const [graphKey, setGraphKey] = useState(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setApiStatus('Calling API...');
      
      // SỬA LỖI 2: XÂY DỰNG CHUỖI DỮ LIỆU CỐ ĐỊNH
      let sequence = [];
      if (anomalyTarget) {
        // Nếu có bất thường, tạo một chuỗi chứa bất thường ở nửa sau
        sequence = [
          ...Array(5).fill(createNormalSnapshot()),
          ...Array(5).fill(createAnomalousSnapshot(anomalyTarget))
        ];
      } else {
        // Nếu không, tạo một chuỗi hoàn toàn bình thường
        sequence = Array(SEQUENCE_LENGTH).fill(createNormalSnapshot());
      }
      
      fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence }),
      })
      .then(res => res.json())
      .then(data => {
        setSystemRisk(data.anomaly_probability);
        setApiStatus('Success');
      })
      .catch(err => {
        console.error("API call failed:", err);
        setApiStatus('Failed');
      });
    }, 3000);
    return () => clearInterval(intervalId);
  }, [anomalyTarget]); // Chỉ phụ thuộc vào anomalyTarget

  const initialPositions: Record<string, { x: number, y: number }> = {
    LEO_1: { x: 100, y: 100 }, LEO_2: { x: 300, y: 0 }, LEO_3: { x: 500, y: 100 },
    GEO_1: { x: 300, y: 200 }, GS_Hanoi: { x: 0, y: 400 }, GS_Frankfurt: { x: 200, y: 400 },
    GS_NewYork: { x: 400, y: 400 }, GS_Singapore: { x: 600, y: 400 },
  };

  const graphNodes: Node[] = NODE_NAMES.map(name => {
    let color = STATUS_COLORS.normal;
    if (name === anomalyTarget && systemRisk > 0.5) {
      color = systemRisk > 0.8 ? STATUS_COLORS.anomaly : STATUS_COLORS.warning;
    }

    return {
      id: name,
      position: initialPositions[name],
      data: { label: `${name}` },
      style: { 
        backgroundColor: color, 
        border: anomalyTarget === name ? '3px solid red' : '1px solid black',
        transition: 'background-color 0.5s ease',
        color: (name === anomalyTarget && systemRisk > 0.5) ? 'white' : 'black',
        fontWeight: (name === anomalyTarget && systemRisk > 0.5) ? 'bold' : 'normal',
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
              const newTarget = e.target.value || null;
              setAnomalyTarget(newTarget);
              setSystemRisk(0);
              setGraphKey(Date.now()); 
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
        <NetworkGraph key={graphKey} nodes={graphNodes} />
      </main>
    </div>
  );
}

export default App;
