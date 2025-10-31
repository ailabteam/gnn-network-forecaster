// src/App.tsx

import NetworkGraph from './components/NetworkGraph';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GNN Anomaly Forecaster - PoC #2</h1>
        <p>Real-time visualization of a simulated SAGINs network.</p>
      </header>
      <main className="app-main">
        {/* Component đồ thị sẽ chiếm toàn bộ không gian chính */}
        <NetworkGraph />
      </main>
    </div>
  );
}

export default App;
