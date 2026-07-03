import { iterateDevices, getRoomDevices } from './roomData';

const OFFICE_OPEN_HOUR = 9;
const OFFICE_CLOSE_HOUR = 17;
const CONTINUOUS_THRESHOLD_MS = 2 * 60 * 60 * 1000;

export function parseLastChanged(lastChanged) {
  if (!lastChanged || lastChanged === 'InitializationReset') return null;
  const parsed = new Date(lastChanged.replace(' ', 'T'));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isAfterOfficeHours(now = new Date()) {
  const hour = now.getHours();
  return hour < OFFICE_OPEN_HOUR || hour >= OFFICE_CLOSE_HOUR;
}

export function formatAlertTimestamp(now = new Date()) {
  return now.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function isRoomContinuouslyOn(rooms, roomName, now) {
  const devices = getRoomDevices(rooms, roomName);
  if (devices.length === 0) return false;
  if (!devices.every((d) => d.isSwitchedOn)) return false;

  return devices.every((device) => {
    const changedAt = parseLastChanged(device.lastChanged);
    if (!changedAt) return false;
    return now.getTime() - changedAt.getTime() >= CONTINUOUS_THRESHOLD_MS;
  });
}

/**
 * Derives active alerts from the dbstream rooms payload.
 * Re-evaluated on each poll and on a clock tick for office-hours boundaries.
 */
export function computeAlerts(rooms, now = new Date()) {
  const alerts = [];
  const timestamp = formatAlertTimestamp(now);

  if (isAfterOfficeHours(now)) {
    iterateDevices(rooms, (device) => {
      if (!device.isSwitchedOn) return;

      alerts.push({
        id: `after_hours_${device.key}`,
        type: 'after_hours_active',
        priority: 'high',
        timestamp,
        roomName: device.roomName,
        device: device.deviceName,
        message: `${device.deviceName} is running outside office hours (9:00 AM – 5:00 PM).`,
      });
    });
  }

  for (const roomName of Object.keys(rooms)) {
    if (!isRoomContinuouslyOn(rooms, roomName, now)) continue;

    alerts.push({
      id: `continuous_${roomName}`,
      type: 'continuous_usage',
      priority: 'medium',
      timestamp,
      roomName,
      message: `All devices in ${roomName} have been on continuously for more than 2 hours.`,
    });
  }

  alerts.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1 };
    return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
  });

  return alerts;
}
