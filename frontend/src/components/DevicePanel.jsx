import React from 'react';
import './DevicePanel.css';
import { getRoomDevices, countDevices } from '../utils/roomData';
import { getDeviceUptime } from '../utils/uptime';

const DevicePanel = ({ rooms }) => {
  const { active: totalActive } = countDevices(rooms);
  const roomNames = Object.keys(rooms);

  return (
    <div className="device-panel-container">
      <div className="panel-header">
        <h3>Device Status</h3>
        <span className="device-count-badge">{totalActive} Active</span>
      </div>

      <div className="rooms-grid">
        {roomNames.map((roomName) => {
          const roomDevices = getRoomDevices(rooms, roomName);
          const activeInRoom = roomDevices.filter((d) => d.isSwitchedOn).length;

          return (
            <div key={roomName} className="room-card">
              <div className="room-card-header">
                <h4>{roomName}</h4>
                <span className="room-active-count">
                  {activeInRoom} / {roomDevices.length} ON
                </span>
              </div>

              <div className="room-devices-list">
                {roomDevices.map((device) => {
                  const isOn = device.isSwitchedOn;
                  const isLight = device.category === 'lights';
                  const uptime = getDeviceUptime(device);

                  return (
                    <div key={device.key} className={`device-row ${isOn ? 'row-active' : ''} ${uptime?.isLongRunning ? 'long-running' : ''}`}>
                      <div className="device-info">
                        <div className={`device-icon-wrapper ${isOn ? 'icon-on' : ''} type-${device.category === 'lights' ? 'light' : 'fan'}`}>
                          {isLight ? (
                            <svg viewBox="0 0 24 24" className="icon-svg">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 18h-4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1z" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="icon-svg fan-spinning-icon">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16.93V15c0-.55-.45-1-1-1s-1 .45-1 1v3.93c-3.07-.44-5.5-2.87-5.93-5.93H9c.55 0 1-.45 1-1s-.45-1-1-1H5.07c.44-3.07 2.87-5.5 5.93-5.93V9c0 .55.45 1 1 1s1-.45 1-1V5.07c3.07.44 5.5 2.87 5.93 5.93H15c-.55 0-1 .45-1 1s.45 1 1 1h3.93c-.44 3.07-2.87 5.5-5.93 5.93z" />
                            </svg>
                          )}
                        </div>
                        <div className="device-name-block">
                          <span className="device-name">{device.deviceName}</span>
                          <span className="device-wattage">{device.watts} W</span>
                        </div>
                      </div>

                      <div className="device-status-badge">
                        <span className={`status-badge ${isOn ? 'badge-on' : 'badge-off'}`}>
                          {isOn ? 'ON' : 'OFF'}
                        </span>
                        {uptime && (
                          <span className={`uptime-tag ${uptime.isLongRunning ? 'uptime-long' : ''}`} title={`On since ${device.lastChanged}`}>
                            {uptime.formatted}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DevicePanel;
