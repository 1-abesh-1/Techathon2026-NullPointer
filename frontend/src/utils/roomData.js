export const DEVICE_CATEGORIES = ['lights', 'fans'];

const DEFAULT_WATTS = { lights: 15, fans: 60 };

export function deviceKey(roomName, category, deviceName) {
  return `${roomName}::${category}::${deviceName}`;
}

export function iterateDevices(rooms, callback) {
  if (!rooms) return;

  for (const [roomName, roomData] of Object.entries(rooms)) {
    for (const category of DEVICE_CATEGORIES) {
      const categoryDevices = roomData?.[category];
      if (!categoryDevices) continue;

      for (const [deviceName, device] of Object.entries(categoryDevices)) {
        callback({
          key: deviceKey(roomName, category, deviceName),
          roomName,
          category,
          deviceName,
          isSwitchedOn: Boolean(device.isSwitchedOn),
          lastChanged: device.lastChanged ?? '',
          watts: device.watts ?? 0,
        });
      }
    }
  }
}

export function getRoomDevices(rooms, roomName) {
  const devices = [];
  iterateDevices(rooms, (device) => {
    if (device.roomName === roomName) {
      devices.push(device);
    }
  });
  return devices.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category === 'lights' ? -1 : 1;
    }
    return a.deviceName.localeCompare(b.deviceName);
  });
}

export function getRoomPower(rooms, roomName) {
  let total = 0;
  iterateDevices(rooms, (device) => {
    if (device.roomName === roomName && device.isSwitchedOn) {
      total += device.watts > 0 ? device.watts : (DEFAULT_WATTS[device.category] ?? 0);
    }
  });
  return total;
}

export function getTotalPower(rooms) {
  let total = 0;
  iterateDevices(rooms, (device) => {
    if (device.isSwitchedOn) {
      total += device.watts > 0 ? device.watts : (DEFAULT_WATTS[device.category] ?? 0);
    }
  });
  return total;
}

export function getMaxPower(rooms) {
  let max = 0;
  iterateDevices(rooms, (device) => {
    max += DEFAULT_WATTS[device.category] ?? device.watts;
  });
  return max;
}

export function countDevices(rooms) {
  let active = 0;
  let total = 0;
  iterateDevices(rooms, (device) => {
    total += 1;
    if (device.isSwitchedOn) active += 1;
  });
  return { active, total };
}
