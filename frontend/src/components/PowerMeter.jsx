import React from 'react';
import './PowerMeter.css';
import {
  getRoomPower,
  getTotalPower,
  countDevices,
  getMaxPower,
} from '../utils/roomData';

const ROOM_ORDER = ['Living Room', 'WorkRoom1', 'WorkRoom2'];

const PowerMeter = ({ rooms }) => {
  const totalPower = getTotalPower(rooms);
  const maxPower = getMaxPower(rooms);
  const { active, total } = countDevices(rooms);
  const percentage = maxPower > 0 ? Math.min(Math.round((totalPower / maxPower) * 100), 100) : 0;

  let accentColor = '#10b981';
  if (percentage > 50 && percentage <= 80) {
    accentColor = '#f59e0b';
  } else if (percentage > 80) {
    accentColor = '#ef4444';
  }

  const roomPowers = ROOM_ORDER.map((roomName) => ({
    roomName,
    power: getRoomPower(rooms, roomName),
    maxRoomPower: getMaxPower({ [roomName]: rooms[roomName] }),
  }));

  return (
    <div className="power-meter-container">
      <h3>Power Consumption</h3>

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
                stroke: accentColor,
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
            <span className="stat-value">{active} / {total}</span>
          </div>
        </div>
      </div>

      <div className="room-breakdown-section">
        <h4>Per-Room Usage</h4>

        {roomPowers.map(({ roomName, power, maxRoomPower }) => (
          <div key={roomName} className="room-bar-row">
            <div className="room-bar-header">
              <span>{roomName}</span>
              <span className="room-wattage">{power} W</span>
            </div>
            <div className="bar-bg">
              <div
                className="bar-fill drawing-room-bar"
                style={{
                  width: `${maxRoomPower > 0 ? Math.min((power / maxRoomPower) * 100, 100) : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PowerMeter;
