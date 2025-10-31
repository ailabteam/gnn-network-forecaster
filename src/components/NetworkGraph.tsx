// src/components/NetworkGraph.tsx

import { memo, useCallback } from 'react'; // Import memo để tối ưu hóa
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Node, // Import kiểu Node
} from 'reactflow';

import 'reactflow/dist/style.css';

// Dữ liệu cạnh có thể giữ cố định
const initialEdges = [
    { id: 'e1-2', source: 'LEO_1', target: 'LEO_2', animated: true }, { id: 'e2-3', source: 'LEO_2', target: 'LEO_3', animated: true },
    { id: 'e3-1', source: 'LEO_3', target: 'LEO_1', animated: true }, { id: 'eL1-G1', source: 'LEO_1', target: 'GEO_1' },
    { id: 'eL2-G1', source: 'LEO_2', target: 'GEO_1' }, { id: 'eL3-G1', source: 'LEO_3', target: 'GEO_1' },
    { id: 'eG1-HN', source: 'GEO_1', target: 'GS_Hanoi' }, { id: 'eG1-FRA', source: 'GEO_1', target: 'GS_Frankfurt' },
    { id: 'eG1-NYC', source: 'GEO_1', target: 'GS_NewYork' }, { id: 'eG1-SIN', source: 'GEO_1', target: 'GS_Singapore' },
];

// Định nghĩa props mà component này sẽ nhận
interface NetworkGraphProps {
  nodes: Node[]; // Sẽ nhận một mảng các nút từ App.tsx
}

// --- Component Chính (được bọc trong memo) ---
const NetworkGraph = ({ nodes: initialNodes }: NetworkGraphProps) => {
  // Bây giờ, initialNodes được truyền từ props
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        // QUAN TRỌNG: Truyền state `nodes` vào đây
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        // Giữ các nút ở yên vị trí
        nodesDraggable={false}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

// memo() là một kỹ thuật tối ưu hóa, nó sẽ chỉ render lại component này
// khi props 'nodes' thực sự thay đổi.
export default memo(NetworkGraph);
