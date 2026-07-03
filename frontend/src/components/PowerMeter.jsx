import React from 'react';
import './PowerMeter.css';

const PowerMeter = ({ devices }) => {
  // Constants for power calculation
  const getRoomPower = (roomKey) => {
    return Object.values(devices)
      .filter((device) => device.room === roomKey && device.status)
      .reduce((sum, device) => sum + device.power, 0);
  };

  const drawingRoomPower = getRoomPower('drawing_room');
  const workRoom1Power = getRoomPower('work_room_1');
  const workRoom2Power = getRoomPower('work_room_2');

  const totalPower = drawingRoomPower + workRoom1Power + workRoom2Power;
  
  // Maximum theoretical power (3 rooms * (3 * 15W + 2 * 75W)) = 3 * (45 + 150) = 585W
  const maxPower = 585;
  const percentage = Math.min(Math.round((totalPower / maxPower) * 100), 100);

  // Determine indicator color based on usage
  let accentColor = '#10b981'; // Green
  if (percentage > 50 && percentage <= 80) {
    accentColor = '#f59e0b'; // Amber
  } else if (percentage > 80) {
    accentColor = '#ef4444'; // Red
  }

  return (
    <div className="power-meter-container">
      <h3>Live Power Consumption</h3>
      
      <div className="power-hero-section">
        <div className="radial-meter-wrapper">
          <svg className="radial-meter" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" className="radial-bg" />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              className="radial-fill" 
              style={{
                strokeDasharray: `${2 * Math.PI * 50}`,
                strokeDashoffset: `${2 * Math.PI * 50 * (1 - percentage / 100)}`,
                stroke: accentColor
              }}
            />
          </svg>
          <div className="radial-content">
            <span className="power-value">{totalPower}</span>
            <span className="power-unit">Watts</span>
          </div>
        </div>
        
        <div className="power-quick-stats">
          <div className="stat-row">
            <span className="stat-label">System Load</span>
            <span className="stat-value" style={{ color: accentColor }}>{percentage}%</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Active Devices</span>
            <span className="stat-value">
              {Object.values(devices).filter(d => d.status).length} / {Object.keys(devices).length}
            </span>
          </div>
        </div>
      </div>

      <div className="room-breakdown-section">
        <h4>Per-Room Usage</h4>
        
        <div className="room-bar-row">
          <div className="room-bar-header">
            <span>Drawing Room</span>
            <span className="room-wattage">{drawingRoomPower} W</span>
          </div>
          <div className="bar-bg">
            <div 
              className="bar-fill drawing-room-bar" 
              style={{ width: `${Math.min((drawingRoomPower / 195) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="room-bar-row">
          <div className="room-bar-header">
            <span>Work Room 1</span>
            <span className="room-wattage">{workRoom1Power} W</span>
          </div>
          <div className="bar-bg">
            <div 
              className="bar-fill workroom1-bar" 
              style={{ width: `${Math.min((workRoom1Power / 195) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="room-bar-row">
          <div className="room-bar-header">
            <span>Work Room 2</span>
            <span className="room-wattage">{workRoom2Power} W</span>
          </div>
          <div className="bar-bg">
            <div 
              className="bar-fill workroom2-bar" 
              style={{ width: `${Math.min((workRoom2Power / 195) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerMeter;
