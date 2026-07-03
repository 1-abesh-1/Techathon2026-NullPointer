import React, { useState, useEffect } from 'react';
import OfficeLayout from './components/OfficeLayout';
import PowerMeter from './components/PowerMeter';
import DevicePanel from './components/DevicePanel';
import AlertsPanel from './components/AlertsPanel';
import { db, ref, onValue } from './services/firebase';
import './App.css';

function App() {
  const [devices, setDevices] = useState({});
  const [rooms, setRooms] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [simulation, setSimulation] = useState({
    simulatedHour: 14,
    timeOffsetHours: 0,
    isSimulating: false
  });

  // Subscribe to real-time events from Mock Firebase Server via SSE adapter
  useEffect(() => {
    const dbRef = ref(db);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setDevices(val.devices || {});
        setRooms(val.rooms || {});
        setAlerts(val.alerts || []);
        setSimulation(val.simulation || {
          simulatedHour: 14,
          timeOffsetHours: 0,
          isSimulating: false
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Read-only dashboard — no write operations permitted.

  const simulatedHour = simulation.simulatedHour;

  return (
    <div className="dashboard-app">
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="logo-icon">🏢</div>
          <div>
            <h1>NullPointer Dashboard</h1>
            <p className="subtitle">Real-time Office Monitoring Command Center (Zero-Config Client Mode)</p>
          </div>
        </div>

        {/* Read-only status display */}
        <div className="status-bar">
          <div className="status-pill">
            <span className="status-dot" style={{ background: simulation.isSimulating ? '#10b981' : '#64748b' }} />
            {simulation.isSimulating ? 'Live' : 'Paused'}
          </div>
          <div className="status-pill">
            <span>⏰</span>
            <span className="status-time">
              {simulatedHour === 0 ? '12:00 AM' :
               simulatedHour === 12 ? '12:00 PM' :
               simulatedHour > 12 ? `${simulatedHour - 12}:00 PM` : `${simulatedHour}:00 AM`}
            </span>
          </div>
          <div className="status-pill">
            {simulatedHour >= 9 && simulatedHour < 17
              ? <><span>🟢</span><span>Office Hours</span></>
              : <><span>🔴</span><span>After Hours</span></>}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="dashboard-grid">
        <div className="grid-left-col">
          <OfficeLayout devices={devices} rooms={rooms} />
        </div>
        <div className="grid-right-col">
          <PowerMeter devices={devices} />
          <AlertsPanel alerts={alerts} />
        </div>
      </main>

      {/* Footer / Device Panel Grid */}
      <footer className="dashboard-footer">
        <DevicePanel devices={devices} rooms={rooms} />
      </footer>
    </div>
  );
}

export default App;
