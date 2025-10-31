// src/App.tsx

import { useState, useEffect, useMemo } from 'react'; // Import thêm useMemo
import NetworkGraph from './components/NetworkGraph';
import { Node } from 'reactflow';
import './App.css';

// --- Định nghĩa không thay đổi ---
const NODE_NAMES = ['GEO_1', 'GS_Frankfurt', 'GS_Hanoi', 'GS_NewYork', 'GS_Singapore', 'LEO_1', 'LEO_2', 'LEO_3'];
const SEQUENCE_LENGTH = 10;
const STATUS_COLORS = { normal: '#89CFF0', warning: '#FFD700', anomaly: '#FF6347' };

const createNormalSnapshot = () => { /* ... giữ nguyên ... */ 
  const nodes = NODE_NAMES.map(name => ({ name, load: 0.2, queue_size: 15 }));
  const edges = [{"source": "LEO_1", "target": "LEO_2", "latency": 5.0, "bandwidth": 0.4}, {"source": "LEO_1", "target": "GS_Hanoi", "latency": 10.0, "bandwidth": 0.6}, {"source": "GS_NewYork", "target": "GEO_1", "latency": 70.0, "bandwidth": 0.3}];
  return { nodes, edges };
};
const createAnomalousSnapshot = (targetNode: string) => { /* ... giữ nguyên ... */ 
  const nodes = NODE_NAMES.map(name => (name === targetNode) ? { name, load: 0.95, queue_size: 95 } : { name, load: 0.2, queue_size: 15 });
  const edges = [{"source": "LEO_1", "target": "LEO_2", "latency": 5.0, "bandwidth": 0.4}, {"source": "LEO_1", "target": "GS_Hanoi", "latency": 10.0, "bandwidth": 0.6}, {"source": "GS_NewYork", "target": "GEO_1", "latency": 70.0, "bandwidth": 0.3}];
  return { nodes, edges };
};

// --- Component Chính ---
function App() {
  const [systemRisk, setSystemRisk] = useState(0);
  const [anomalyTarget, setAnomalyTarget] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState('Idle');

  useEffect(() => {
    // ... logic useEffect giữ nguyên, không thay đổi ...
    const intervalId = setInterval(() => {
      setApiStatus('Calling API...');
      let sequence = anomalyTarget ? [...Array(5).fill(createNormalSnapshot()), ...Array(5).fill(createAnomalousSnapshot(anomalyTarget))] : Array(SEQUENCE_LENGTH).fill(createNormalSnapshot());
      
      fetch('/api/forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sequence }), })
      .then(res => res.json())
      .then(data => { setSystemRisk(data.anomaly_probability); setApiStatus('Success'); })
      .catch(err => { console.error("API call failed:", err); setApiStatus('Failed'); });
    }, 3000);
    return () => clearInterval(intervalId);
  }, [anomalyTarget]);

  const initialPositions: Record<string, { x: number, y: number }> = {
    LEO_1: { x: 100, y: 100 }, LEO_2: { x: 300, y: 0 }, LEO_3: { x: 500, y: 100 },
    GEO_1: { x: 300, y: 200 }, GS_Hanoi: { x: 0, y: 400 }, GS_Frankfurt: { x: 200, y: 400 },
    GS_NewYork: { x: 400, y: 400 }, GS_Singapore: { x: 600, y: 400 },
  };

  // SỬA LỖI: SỬ DỤNG useMemo ĐỂ TÍNH TOÁN LẠI `graphNodes` MỘT CÁCH ĐÁNG TIN CẬY
  const graphNodes: Node[] = useMemo(() => {
    console.log(`Recalculating nodes. Target: ${anomalyTarget}, Risk: ${systemRisk}`); // Thêm log để debug

    return NODE_NAMES.map(name => {
      let color = STATUS_COLORS.normal;
      // Chỉ tô màu nếu nút này LÀ nút mục tiêu VÀ rủi ro hệ thống cao
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
  // Phụ thuộc vào `anomalyTarget` và `systemRisk`. Chỉ tính toán lại khi một trong hai thay đổi.
  }, [anomalyTarget, systemRisk]);


  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GNN Anomaly Forecaster - PoC #2</h1>
        <div className="controls">
          <span>Inject Anomaly on: </span>
          <select onChange={(e) => {
              const newTarget = e.target.value || null;
              setAnomalyTarget(newTarget);
              setSystemRisk(0); // Reset risk để giao diện phản ứng ngay
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
        {/* Không cần key ở đây nữa vì useMemo đã xử lý việc cập nhật */}
        <NetworkGraph nodes={graphNodes} />
      </main>
    </div>
  );
}

export default App;
