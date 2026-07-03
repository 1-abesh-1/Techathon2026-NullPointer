import React, { useState, useEffect } from 'react';
import OfficeLayout from './components/OfficeLayout';
import PowerMeter from './components/PowerMeter';
import DevicePanel from './components/DevicePanel';
import { subscribeToDbStream } from './services/firebase';
import './App.css';

function App() {
  const [rooms, setRooms] = useState({});
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToDbStream((data) => {
      setRooms(data.rooms || {});
      setConnected(true);
      setLastUpdated(new Date());
    });

    return unsubscribe;
  }, []);

  return (
    <div className="dashboard-app">
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="logo-icon">🏢</div>
          <div>
            <h1>NullPointer Dashboard</h1>
            <p className="subtitle">Real-time Office Monitoring</p>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-pill">
            <span
              className="status-dot"
              style={{ background: connected ? '#10b981' : '#64748b' }}
            />
            {connected ? 'Live' : 'Connecting…'}
          </div>
          {lastUpdated && (
            <div className="status-pill">
              <span>Updated</span>
              <span className="status-time">
                {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-grid">
        <div className="grid-left-col">
          <OfficeLayout rooms={rooms} />
        </div>
        <div className="grid-right-col">
          <PowerMeter rooms={rooms} />
        </div>
      </main>

      <footer className="dashboard-footer">
        <DevicePanel rooms={rooms} />
      </footer>
    </div>
  );
}

export default App;
