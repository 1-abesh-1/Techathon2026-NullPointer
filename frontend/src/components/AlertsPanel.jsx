import React from 'react';
import './AlertsPanel.css';

const AlertsPanel = ({ alerts }) => {
  return (
    <div className="alerts-panel-container">
      <div className="alerts-header">
        <div className="alerts-title-block">
          <span className="alert-bell-icon">🔔</span>
          <h3>Active Anomalous Alerts</h3>
        </div>

      </div>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts-state">
            <svg viewBox="0 0 24 24" className="shield-icon">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 10.99h-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm0 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </svg>
            <p>Office operations normal. No anomalous device activity detected.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`alert-card priority-${alert.priority || 'medium'}`}>
              <div className="alert-header">
                <span className="alert-badge">{alert.type.replace(/_/g, ' ')}</span>
                <span className="alert-time">{alert.timestamp}</span>
              </div>
              <p className="alert-message">{alert.message}</p>
              <div className="alert-details">
                <span>Location: {alert.roomName}</span>
                {alert.device && <span>Device: {alert.device}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
