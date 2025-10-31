// src/components/NetworkGraph.tsx

import { useCallback } from 'react'; // SỬA LỖI 1: Xóa 'React'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant, // SỬA LỖI 3: Import BackgroundVariant
} from 'reactflow';

import 'reactflow/dist/style.css';

// --- Dữ liệu ban đầu (giữ nguyên) ---
const initialNodes = [
    { id: 'LEO_1', position: { x: 100, y: 100 }, data: { label: 'LEO 1' }, style: { backgroundColor: '#89CFF0', border: '1px solid black' } },
    { id: 'LEO_2', position: { x: 300, y: 0 }, data: { label: 'LEO 2' }, style: { backgroundColor: '#89CFF0', border: '1px solid black' } },
    { id: 'LEO_3', position: { x: 500, y: 100 }, data: { label: 'LEO 3' }, style: { backgroundColor: '#89CFF0', border: '1px solid black' } },
    { id: 'GEO_1', position: { x: 300, y: 200 }, data: { label: 'GEO 1' }, style: { backgroundColor: '#FFD700', border: '1px solid black', width: 80 } },
    { id: 'GS_Hanoi', position: { x: 0, y: 400 }, data: { label: 'GS Hanoi' }, style: { backgroundColor: '#90EE90', border: '1px solid black' } },
    { id: 'GS_Frankfurt', position: { x: 200, y: 400 }, data: { label: 'GS Frankfurt' }, style: { backgroundColor: '#90EE90', border: '1px solid black' } },
    { id: 'GS_NewYork', position: { x: 400, y: 400 }, data: { label: 'GS New York' }, style: { backgroundColor: '#90EE90', border: '1px solid black' } },
    { id: 'GS_Singapore', position: { x: 600, y: 400 }, data: { label: 'GS Singapore' }, style: { backgroundColor: '#90EE90', border: '1px solid black' } },
];

const initialEdges = [
    { id: 'e1-2', source: 'LEO_1', target: 'LEO_2', animated: true }, { id: 'e2-3', source: 'LEO_2', target: 'LEO_3', animated: true },
    { id: 'e3-1', source: 'LEO_3', target: 'LEO_1', animated: true }, { id: 'eL1-G1', source: 'LEO_1', target: 'GEO_1' },
    { id: 'eL2-G1', source: 'LEO_2', target: 'GEO_1' }, { id: 'eL3-G1', source: 'LEO_3', target: 'GEO_1' },
    { id: 'eG1-HN', source: 'GEO_1', target: 'GS_Hanoi' }, { id: 'eG1-FRA', source: 'GEO_1', target: 'GS_Frankfurt' },
    { id: 'eG1-NYC', source: 'GEO_1', target: 'GS_NewYork' }, { id: 'eG1-SIN', source: 'GEO_1', target: 'GS_Singapore' },
];


// --- Component Chính ---
const NetworkGraph = () => {
  // SỬA LỖI 2: Bỏ qua `setNodes` vì chưa dùng đến
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        {/* SỬA LỖI 3: Sử dụng Enum thay vì chuỗi */}
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default NetworkGraph;
