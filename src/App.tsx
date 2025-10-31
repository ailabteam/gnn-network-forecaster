// src/App.tsx

import { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import { Node, useNodesState } from 'reactflow'; // Import thêm useNodesState
import './App.css';

// --- Định nghĩa không thay đổi ---
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
    style: { backgroundColor: STATUS_COLORS.normal, border: '1px solid black' },
}));

const createNormalSnapshot = () => { /* ... giữ nguyên ... */ };
const createAnomalousSnapshot = (targetNode: string) => { /* ... giữ nguyên ... */ };

// --- Component Chính ---
function App() {
  // SỬA LỖI: App sẽ quản lý state của nodes
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [systemRisk, setSystemRisk] = useState(0);
  const [anomalyTarget, setAnomalyTarget] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState('Idle');

  // Hook để gọi API
  useEffect(() => {
    // ... logic useEffect để gọi API giữ nguyên ...
  }, [anomalyTarget]);

  // SỬA LỖI: Hook MỚI để cập nhật màu sắc nodes KHI CÓ KẾT QUẢ MỚI
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        let color = STATUS_COLORS.normal;
        if (node.id === anomalyTarget && systemRisk > 0.5) {
          color = systemRisk > 0.8 ? STATUS_COLORS.anomaly : STATUS_COLORS.warning;
        }

        node.style = {
          ...node.style,
          backgroundColor: color,
          border: anomalyTarget === node.id ? '3px solid red' : '1px solid black',
          color: (node.id === anomalyTarget && systemRisk > 0.5) ? 'white' : 'black',
        };
        return node;
      })
    );
  }, [systemRisk, anomalyTarget, setNodes]);


  return (
    <div className="app-container">
      <header className="app-header">
        {/* ... phần header giữ nguyên ... */}
      </header>
      <main className="app-main">
        {/* Truyền nodes và onNodesChange xuống */}
        <NetworkGraph nodes={nodes} onNodesChange={onNodesChange} />
      </main>
    </div>
  );
}

// (Toàn bộ code của App.tsx để bạn copy-paste)
const FullApp = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [systemRisk, setSystemRisk] = useState(0);
    const [anomalyTarget, setAnomalyTarget] = useState<string | null>(null);
    const [apiStatus, setApiStatus] = useState('Idle');
  
    // Hook để gọi API
    useEffect(() => {
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

    // Hook để cập nhật màu sắc
    useEffect(() => {
        setNodes((nds) =>
          nds.map((node) => {
            let color = STATUS_COLORS.normal;
            if (node.id === anomalyTarget && systemRisk > 0.5) {
              color = systemRisk > 0.8 ? STATUS_COLORS.anomaly : STATUS_COLORS.warning;
            }

            node.style = {
              ...node.style,
              backgroundColor: color,
              border: anomalyTarget === node.id ? '3px solid red' : '1px solid black',
              color: (node.id === anomalyTarget && systemRisk > 0.5) ? 'white' : 'black',
              fontWeight: (node.id === anomalyTarget && systemRisk > 0.5) ? 'bold' : 'normal',
              transition: 'background-color 0.5s ease',
            };
            return node;
          })
        );
      }, [systemRisk, anomalyTarget, setNodes]);
  
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
          <NetworkGraph nodes={nodes} onNodesChange={onNodesChange} />
        </main>
      </div>
    );
}
export default FullApp;
