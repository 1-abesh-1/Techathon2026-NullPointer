import React from 'react';
import './DevicePanel.css';

const DevicePanel = ({ devices, rooms }) => {
  const getDevicesInRoom = (roomKey) => {
    return Object.entries(devices)
      .filter(([_, d]) => d.room === roomKey)
      .sort((a, b) => {
        if (a[1].type !== b[1].type) {
          return a[1].type === 'light' ? -1 : 1;
        }
        return a[1].name.localeCompare(b[1].name);
      });
  };

  return (
    <div className="device-panel-container">
      <div className="panel-header">
        <h3>Live Device Status</h3>
        <span className="device-count-badge">
          {Object.values(devices).filter(d => d.status).length} Active
        </span>
      </div>

      <div className="rooms-grid">
        {Object.entries(rooms).map(([roomKey, roomInfo]) => {
          const roomDevices = getDevicesInRoom(roomKey);

          return (
            <div key={roomKey} className={`room-card room-${roomKey}`}>
              <div className="room-card-header">
                <h4>{roomInfo.name}</h4>
                <span className="room-active-count">
                  {roomDevices.filter(([_, d]) => d.status).length} / {roomDevices.length} ON
                </span>
              </div>

              <div className="room-devices-list">
                {roomDevices.map(([key, device]) => {
                  const isOn = device.status;
                  const isLight = device.type === 'light';

                  return (
                    <div key={key} className={`device-row ${isOn ? 'row-active' : ''}`}>
                      <div className="device-info">
                        <div className={`device-icon-wrapper ${isOn ? 'icon-on' : ''} type-${device.type}`}>
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
                          <span className="device-name">{device.name}</span>
                          <span className="device-wattage">{device.power} W</span>
                        </div>
                      </div>

                      <div className="device-status-badge">
                        <span className={`status-badge ${isOn ? 'badge-on' : 'badge-off'}`}>
                          {isOn ? 'ON' : 'OFF'}
                        </span>
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
