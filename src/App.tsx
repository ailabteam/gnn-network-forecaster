// src/App.tsx

import { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import { Node } from 'reactflow';
import './App.css';

// --- Định nghĩa cấu trúc dữ liệu và các hằng số ---
const NODE_NAMES = ['LEO_1', 'LEO_2', 'LEO_3', 'GEO_1', 'GS_Hanoi', 'GS_Frankfurt', 'GS_NewYork', 'GS_Singapore'];
const SEQUENCE_LENGTH = 10; // Giống với lúc training

// Màu sắc cho các trạng thái
const STATUS_COLORS = {
  normal: '#90EE90', // Xanh lá
  warning: '#FFD700', // Vàng
  anomaly: '#FF6347', // Đỏ
};

// Hàm tiện ích để tạo ra một "ảnh chụp" trạng thái mạng giả lập
const generateMockSnapshot = (isAnomalous: boolean, targetNode: string | null) => {
  const nodes = NODE_NAMES.map(name => {
    let load = Math.random() * 0.3; // Tải bình thường < 30%
    let queue_size = Math.random() * 20; // Hàng đợi bình thường < 20
    
    // Tiêm bất thường nếu cần
    if (isAnomalous && name === targetNode) {
      load = 0.8 + Math.random() * 0.2; // Tải bất thường > 80%
      queue_size = 80 + Math.random() * 20; // Hàng đợi bất thường > 80
    }
    return { name, load, queue_size };
  });

  // (Trong PoC thực tế, chúng ta cũng sẽ tạo dữ liệu cạnh động)
  const edges = [
    {"source": "LEO_1", "target": "LEO_2", "latency": 5.0, "bandwidth": 0.4},
    {"source": "LEO_1", "target": "GS_Hanoi", "latency": 10.0, "bandwidth": 0.6},
    {"source": "GS_NewYork", "target": "GEO_1", "latency": 70.0, "bandwidth": 0.3}
  ];

  return { nodes, edges };
};


// --- Component Chính ---
function App() {
  // State để lưu trữ chuỗi các snapshot gần đây
  const [history, setHistory] = useState(() => Array(SEQUENCE_LENGTH).fill(generateMockSnapshot(false, null)));
  // State để lưu trữ điểm rủi ro của mỗi nút
  const [riskScores, setRiskScores] = useState<Record<string, number>>({});
  // State cho nút đang bị "tấn công"
  const [anomalyTarget, setAnomalyTarget] = useState<string | null>(null);

  // --- Logic chính: Gọi API theo chu kỳ ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Tạo snapshot mới
      const newSnapshot = generateMockSnapshot(!!anomalyTarget, anomalyTarget);

      // Cập nhật chuỗi lịch sử (giữ lại 10 snapshot gần nhất)
      const newHistory = [...history.slice(1), newSnapshot];
      setHistory(newHistory);
      
      // Gửi chuỗi lịch sử đến backend để dự đoán
      fetch('/api/forecast', { // Sửa lại tên endpoint cho đúng
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: newHistory }),
      })
      .then(res => res.json())
      .then(data => {
        // Cập nhật điểm rủi ro cho nút mục tiêu
        // (Trong phiên bản nâng cao, API sẽ trả về điểm cho tất cả các nút)
        if (anomalyTarget) {
          setRiskScores(prev => ({ ...prev, [anomalyTarget]: data.anomaly_probability }));
        } else {
          // Khi không có bất thường, reset điểm rủi ro
          setRiskScores({});
        }
      })
      .catch(err => console.error("API call failed:", err));

    }, 3000); // Chạy mỗi 3 giây

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(intervalId);
  }, [history, anomalyTarget]); // Chạy lại hiệu ứng khi history hoặc anomalyTarget thay đổi


  // --- Chuẩn bị dữ liệu `nodes` để truyền xuống NetworkGraph ---
  const initialPositions = {
    LEO_1: { x: 100, y: 100 }, LEO_2: { x: 300, y: 0 }, LEO_3: { x: 500, y: 100 },
    GEO_1: { x: 300, y: 200 }, GS_Hanoi: { x: 0, y: 400 }, GS_Frankfurt: { x: 200, y: 400 },
    GS_NewYork: { x: 400, y: 400 }, GS_Singapore: { x: 600, y: 400 },
  };

  const graphNodes: Node[] = NODE_NAMES.map(name => {
    const risk = riskScores[name] || 0;
    let color = STATUS_COLORS.normal;
    if (risk > 0.8) color = STATUS_COLORS.anomaly;
    else if (risk > 0.5) color = STATUS_COLORS.warning;

    return {
      id: name,
      position: initialPositions[name as keyof typeof initialPositions],
      data: { label: `${name} (Risk: ${risk.toFixed(2)})` },
      style: { 
        backgroundColor: color, 
        border: anomalyTarget === name ? '3px solid #FF0000' : '1px solid black',
        transition: 'background-color 0.5s ease',
      },
    };
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GNN Anomaly Forecaster - PoC #2</h1>
        <div className="controls">
          <span>Inject Anomaly: </span>
          <select onChange={(e) => setAnomalyTarget(e.target.value || null)} value={anomalyTarget || ''}>
            <option value="">-- No Anomaly --</option>
            {NODE_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </header>
      <main className="app-main">
        {/* Truyền prop `nodes` đã được tính toán vào */}
        <NetworkGraph nodes={graphNodes} />
      </main>
    </div>
  );
}

export default App;
