import React from 'react';
import './OfficeLayout.css';
import { DEVICE_POSITIONS, ROOM_LAYOUT } from '../config/deviceLayout';
import { iterateDevices } from '../utils/roomData';

const OfficeLayout = ({ rooms }) => {
  const renderLight = (device) => {
    const position = DEVICE_POSITIONS[device.key];
    if (!position) return null;
    const { x: posX, y: posY } = position;
    const isOn = device.isSwitchedOn;

    return (
      <g
        key={device.key}
        className={`layout-device light-device ${isOn ? 'is-on' : 'is-off'}`}
      >
        {isOn && (
          <circle cx={posX} cy={posY} r="28" className="light-glow-aura" />
        )}
        <circle
          cx={posX}
          cy={posY}
          r="14"
          stroke={isOn ? '#ffb300' : '#4b5563'}
          strokeWidth="2"
          fill={isOn ? '#ffca28' : '#1f2937'}
          className="light-bulb-base"
        />
        <circle cx={posX} cy={posY} r="6" fill={isOn ? '#ffffff' : '#9ca3af'} />
        <title>{`${device.deviceName} (${isOn ? 'ON' : 'OFF'})`}</title>
      </g>
    );
  };

  const renderFan = (device) => {
    const position = DEVICE_POSITIONS[device.key];
    if (!position) return null;
    const { x: posX, y: posY } = position;
    const isOn = device.isSwitchedOn;

    return (
      <g
        key={device.key}
        className={`layout-device fan-device ${isOn ? 'is-on' : 'is-off'}`}
      >
        {isOn && (
          <circle cx={posX} cy={posY} r="32" className="fan-glow-aura" />
        )}
        <g
          className={`fan-rotator ${isOn ? 'spinning' : ''}`}
          style={{ transformOrigin: `${posX}px ${posY}px` }}
        >
          <path
            d={`M ${posX} ${posY} Q ${posX - 8} ${posY - 25} ${posX} ${posY - 30} Q ${posX + 8} ${posY - 25} ${posX} ${posY} Z`}
            fill={isOn ? '#00e5ff' : '#4b5563'}
            stroke={isOn ? '#00b0ff' : '#374151'}
            strokeWidth="1"
          />
          <path
            d={`M ${posX} ${posY} Q ${posX + 23} ${posY - 12} ${posX + 26} ${posY + 15} Q ${posX + 10} ${posY + 24} ${posX} ${posY} Z`}
            fill={isOn ? '#00e5ff' : '#4b5563'}
            stroke={isOn ? '#00b0ff' : '#374151'}
            strokeWidth="1"
          />
          <path
            d={`M ${posX} ${posY} Q ${posX - 23} ${posY + 12} ${posX - 26} ${posY + 15} Q ${posX - 10} ${posY + 24} ${posX} ${posY} Z`}
            fill={isOn ? '#00e5ff' : '#4b5563'}
            stroke={isOn ? '#00b0ff' : '#374151'}
            strokeWidth="1"
          />
        </g>
        <circle
          cx={posX}
          cy={posY}
          r="8"
          fill={isOn ? '#00e5ff' : '#374151'}
          stroke="#1f2937"
          strokeWidth="2"
        />
        <circle cx={posX} cy={posY} r="3" fill="#ffffff" />
        <title>{`${device.deviceName} (${isOn ? 'ON' : 'OFF'})`}</title>
      </g>
    );
  };

  const devices = [];
  iterateDevices(rooms, (device) => devices.push(device));

  return (
    <div className="office-layout-container">
      <div className="layout-header-row">
        <h3>Office Layout (Top View)</h3>
        <span className="layout-instruction">Devices glow when active</span>
      </div>
      <div className="svg-wrapper">
        <svg viewBox="0 0 1000 550" className="office-svg">
          <defs>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.45" />
            </filter>
          </defs>

          <rect width="1000" height="550" fill="#0b0f19" rx="12" />
          <rect x="45" y="45" width="910" height="460" fill="none" stroke="#2a354f" strokeWidth="10" rx="8" filter="url(#shadow)" />
          <rect x="50" y="50" width="900" height="450" fill="#131c31" rx="4" />

          {/* Living Room */}
          <rect x="50" y="50" width="280" height="350" fill="#16223d" opacity="0.6" />
          <line x1="330" y1="50" x2="330" y2="400" stroke="#2a354f" strokeWidth="8" />
          <rect x="70" y="140" width="40" height="170" rx="8" fill="#1e2d4a" stroke="#2d4066" strokeWidth="2" />
          <rect x="72" y="150" width="36" height="40" rx="4" fill="#2d4066" />
          <rect x="72" y="205" width="36" height="40" rx="4" fill="#2d4066" />
          <rect x="72" y="260" width="36" height="40" rx="4" fill="#2d4066" />
          <rect x="145" y="175" width="35" height="100" rx="4" fill="#32261a" stroke="#4a3b2c" strokeWidth="2" />
          <g transform="rotate(25, 90, 345)">
            <rect x="70" y="325" width="40" height="40" rx="6" fill="#1e2d4a" stroke="#2d4066" strokeWidth="2" />
          </g>
          <circle cx="75" cy="80" r="12" fill="#10b981" opacity="0.3" />
          <circle cx="75" cy="80" r="8" fill="#059669" />
          <circle cx="295" cy="370" r="12" fill="#10b981" opacity="0.3" />
          <circle cx="295" cy="370" r="8" fill="#059669" />
          <text x={ROOM_LAYOUT['Living Room'].labelX} y={ROOM_LAYOUT['Living Room'].labelY} fill="#94a3b8" fontSize="16" fontWeight="bold" letterSpacing="1" textAnchor="middle" opacity="0.8">
            {ROOM_LAYOUT['Living Room'].fallbackLabel}
          </text>

          {/* WorkRoom1 */}
          <rect x="330" y="50" width="320" height="350" fill="#182747" opacity="0.4" />
          <line x1="650" y1="50" x2="650" y2="400" stroke="#2a354f" strokeWidth="8" />
          <rect x="350" y="140" width="55" height="40" rx="4" fill="#1e2d4a" stroke="#2d4066" />
          <rect x="350" y="240" width="55" height="40" rx="4" fill="#1e2d4a" stroke="#2d4066" />
          <rect x="575" y="140" width="55" height="40" rx="4" fill="#1e2d4a" stroke="#2d4066" />
          <rect x="575" y="240" width="55" height="40" rx="4" fill="#1e2d4a" stroke="#2d4066" />
          <circle cx="420" cy="160" r="8" fill="#2d4066" />
          <circle cx="420" cy="260" r="8" fill="#2d4066" />
          <circle cx="560" cy="160" r="8" fill="#2d4066" />
          <circle cx="560" cy="260" r="8" fill="#2d4066" />
          <text x={ROOM_LAYOUT.WorkRoom1.labelX} y={ROOM_LAYOUT.WorkRoom1.labelY} fill="#94a3b8" fontSize="16" fontWeight="bold" letterSpacing="1" textAnchor="middle" opacity="0.8">
            {ROOM_LAYOUT.WorkRoom1.fallbackLabel}
          </text>

          {/* WorkRoom2 */}
          <rect x="650" y="50" width="300" height="350" fill="#16223d" opacity="0.6" />
          <rect x="670" y="140" width="55" height="40" rx="4" fill="#1e2d4a" stroke="#2d4066" />
          <rect x="670" y="240" width="55" height="40" rx="4" fill="#1e2d4a" stroke="#2d4066" />
          <rect x="875" y="140" width="55" height="40" rx="4" fill="#1e2d4a" stroke="#2d4066" />
          <rect x="875" y="240" width="55" height="40" rx="4" fill="#1e2d4a" stroke="#2d4066" />
          <circle cx="740" cy="160" r="8" fill="#2d4066" />
          <circle cx="740" cy="260" r="8" fill="#2d4066" />
          <circle cx="860" cy="160" r="8" fill="#2d4066" />
          <circle cx="860" cy="260" r="8" fill="#2d4066" />
          <text x={ROOM_LAYOUT.WorkRoom2.labelX} y={ROOM_LAYOUT.WorkRoom2.labelY} fill="#94a3b8" fontSize="16" fontWeight="bold" letterSpacing="1" textAnchor="middle" opacity="0.8">
            {ROOM_LAYOUT.WorkRoom2.fallbackLabel}
          </text>

          {/* Corridor */}
          <rect x="50" y="400" width="900" height="100" fill="#0f172a" opacity="0.8" />
          <line x1="50" y1="400" x2="950" y2="400" stroke="#2a354f" strokeWidth="8" />
          <rect x="910" y="420" width="25" height="40" rx="2" fill="#334155" />
          <rect x="915" y="405" width="15" height="15" rx="4" fill="#38bdf8" opacity="0.8" />
          <circle cx="75" cy="450" r="12" fill="#10b981" opacity="0.3" />
          <circle cx="75" cy="450" r="8" fill="#059669" />
          <text x="500" y="460" fill="#64748b" fontSize="14" letterSpacing="4" textAnchor="middle" opacity="0.8">
            CORRIDOR / WALKWAY
          </text>

          <g transform="translate(450, 495)">
            <rect x="0" y="0" width="60" height="10" fill="#f59e0b" />
            <path d="M 0 0 A 60 60 0 0 1 60 0" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
          </g>
          <path d="M 220 400 A 40 40 0 0 1 260 400" fill="none" stroke="#2a354f" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M 350 400 A 40 40 0 0 1 390 400" fill="none" stroke="#2a354f" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M 580 400 A 40 40 0 0 1 620 400" fill="none" stroke="#2a354f" strokeWidth="2" strokeDasharray="3 3" />

          {devices.map((device) =>
            device.category === 'lights' ? renderLight(device) : renderFan(device)
          )}
        </svg>
      </div>
    </div>
  );
};

export default OfficeLayout;
