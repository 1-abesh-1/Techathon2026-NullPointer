/**
 * Calculates how long a device has been in its current state.
 * Returns null for OFF devices or invalid timestamps.
 */
const UPTIME_HIGHLIGHT_HOURS = 4;

export function getDeviceUptime(device) {
  if (!device.isSwitchedOn || !device.lastChanged || device.lastChanged === 'InitializationReset') {
    return null;
  }

  try {
    const now = new Date();
    const changed = new Date(device.lastChanged.replace(' ', 'T'));
    const diffMs = now - changed;

    if (diffMs < 0) return null;

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      hours,
      minutes,
      totalMinutes,
      isLongRunning: hours >= UPTIME_HIGHLIGHT_HOURS,
      formatted: hours > 0 && minutes > 0
        ? `${hours}h ${minutes}m`
        : hours > 0
          ? `${hours}h`
          : `${minutes}m`,
    };
  } catch {
    return null;
  }
}
