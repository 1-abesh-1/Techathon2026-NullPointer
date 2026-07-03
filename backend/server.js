import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory Database simulating a full Firebase Realtime Database JSON tree
let dbState = {
  rooms: {
    drawing_room: { name: 'Drawing Room', usage: 'Waiting Area' },
    work_room_1: { name: 'Work Room 1', usage: 'Employees' },
    work_room_2: { name: 'Work Room 2', usage: 'Employees' }
  },
  
  devices: {
    // Drawing Room
    'drawing_room_light_1': { id: 'light_1', name: 'Light 1', type: 'light', room: 'drawing_room', status: false, power: 15, lastToggled: new Date().toISOString() },
    'drawing_room_light_2': { id: 'light_2', name: 'Light 2', type: 'light', room: 'drawing_room', status: false, power: 15, lastToggled: new Date().toISOString() },
    'drawing_room_light_3': { id: 'light_3', name: 'Light 3', type: 'light', room: 'drawing_room', status: false, power: 15, lastToggled: new Date().toISOString() },
    'drawing_room_fan_1':   { id: 'fan_1',   name: 'Fan 1',   type: 'fan',   room: 'drawing_room', status: false, power: 75, lastToggled: new Date().toISOString() },
    'drawing_room_fan_2':   { id: 'fan_2',   name: 'Fan 2',   type: 'fan',   room: 'drawing_room', status: false, power: 75, lastToggled: new Date().toISOString() },

    // Work Room 1
    'work_room_1_light_1': { id: 'light_1', name: 'Light 1', type: 'light', room: 'work_room_1', status: false, power: 15, lastToggled: new Date().toISOString() },
    'work_room_1_light_2': { id: 'light_2', name: 'Light 2', type: 'light', room: 'work_room_1', status: false, power: 15, lastToggled: new Date().toISOString() },
    'work_room_1_light_3': { id: 'light_3', name: 'Light 3', type: 'light', room: 'work_room_1', status: false, power: 15, lastToggled: new Date().toISOString() },
    'work_room_1_fan_1':   { id: 'fan_1',   name: 'Fan 1',   type: 'fan',   room: 'work_room_1', status: false, power: 75, lastToggled: new Date().toISOString() },
    'work_room_1_fan_2':   { id: 'fan_2',   name: 'Fan 2',   type: 'fan',   room: 'work_room_1', status: false, power: 75, lastToggled: new Date().toISOString() },

    // Work Room 2
    'work_room_2_light_1': { id: 'light_1', name: 'Light 1', type: 'light', room: 'work_room_2', status: false, power: 15, lastToggled: new Date().toISOString() },
    'work_room_2_light_2': { id: 'light_2', name: 'Light 2', type: 'light', room: 'work_room_2', status: false, power: 15, lastToggled: new Date().toISOString() },
    'work_room_2_light_3': { id: 'light_3', name: 'Light 3', type: 'light', room: 'work_room_2', status: false, power: 15, lastToggled: new Date().toISOString() },
    'work_room_2_fan_1':   { id: 'fan_1',   name: 'Fan 1',   type: 'fan',   room: 'work_room_2', status: false, power: 75, lastToggled: new Date().toISOString() },
    'work_room_2_fan_2':   { id: 'fan_2',   name: 'Fan 2',   type: 'fan',   room: 'work_room_2', status: false, power: 75, lastToggled: new Date().toISOString() },
  },

  alerts: [],

  simulation: {
    simulatedHour: 14,
    timeOffsetHours: 0,
    isSimulating: false
  }
};

const INITIAL_DB = JSON.parse(JSON.stringify(dbState));

// SSE connected clients
let clients = [];

// Calculate anomalous situations based on current state
const recalculateAlerts = () => {
  const newAlerts = [];
  const simulatedHour = dbState.simulation.simulatedHour;
  const timeOffsetHours = dbState.simulation.timeOffsetHours;

  const formatAlertTime = () => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(simulatedHour)}:00 ${simulatedHour >= 12 ? 'PM' : 'AM'}`;
  };

  // Rule 1: After Office Hours Alert (Office Hours: 9 AM - 5 PM)
  const isOutsideOfficeHours = simulatedHour < 9 || simulatedHour >= 17;
  if (isOutsideOfficeHours) {
    Object.entries(dbState.devices).forEach(([key, device]) => {
      if (device.status) {
        newAlerts.push({
          id: `hours_${key}`,
          type: 'after_hours_active',
          priority: 'high',
          timestamp: formatAlertTime(),
          roomName: dbState.rooms[device.room]?.name || device.room,
          device: device.name,
          message: `[Alert] ${device.name} is running outside office hours (09:00 AM - 05:00 PM).`
        });
      }
    });
  }

  // Rule 2: Room continuously ON > 2 Hours
  Object.keys(dbState.rooms).forEach((roomKey) => {
    const roomDevices = Object.values(dbState.devices).filter((d) => d.room === roomKey);
    const allOn = roomDevices.every((d) => d.status);

    if (allOn) {
      const timestamps = roomDevices.map((d) => new Date(d.lastToggled).getTime());
      const oldestToggledTime = Math.min(...timestamps);
      const effectiveTimeElapsedMs = (Date.now() - oldestToggledTime) + (timeOffsetHours * 60 * 60 * 1000);
      const hoursElapsed = effectiveTimeElapsedMs / (1000 * 60 * 60);

      if (hoursElapsed >= 2.0) {
        newAlerts.push({
          id: `duration_${roomKey}`,
          type: 'all_devices_active_duration',
          priority: 'medium',
          timestamp: formatAlertTime(),
          roomName: dbState.rooms[roomKey]?.name || roomKey,
          message: `[Alert] All devices in this room have been active continuously for ${hoursElapsed.toFixed(1)} hours.`
        });
      }
    }
  });

  dbState.alerts = newAlerts;
};

// Broadcast database state to all connected SSE clients
const broadcastState = () => {
  recalculateAlerts();
  const data = JSON.stringify(dbState);
  clients.forEach((c) => {
    c.res.write(`data: ${data}\n\n`);
  });
};

// Expose standard Firebase RTDB JSON streaming / REST API
app.get('/db.json', (req, res) => {
  if (req.headers.accept === 'text/event-stream') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Initial broadcast
    recalculateAlerts();
    res.write(`data: ${JSON.stringify(dbState)}\n\n`);

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);

    req.on('close', () => {
      clients = clients.filter(c => c.id !== clientId);
    });
  } else {
    recalculateAlerts();
    res.json(dbState);
  }
});

// Stream endpoint fallback for direct EventSource subscription
app.get('/db/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  recalculateAlerts();
  res.write(`data: ${JSON.stringify(dbState)}\n\n`);

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// Expose standard PATCH at /devices/:key.json to simulate Firebase write
app.patch('/devices/:deviceKey.json', (req, res) => {
  const { deviceKey } = req.params;
  const updates = req.body;

  if (dbState.devices[deviceKey]) {
    dbState.devices[deviceKey] = {
      ...dbState.devices[deviceKey],
      ...updates
    };
    broadcastState();
    res.json(dbState.devices[deviceKey]);
  } else {
    res.status(404).json({ error: 'Device not found' });
  }
});

// Expose standard PATCH at /simulation.json to modify simulated hour / offsets
app.patch('/simulation.json', (req, res) => {
  const updates = req.body;
  
  dbState.simulation = {
    ...dbState.simulation,
    ...updates
  };

  // Manage simulated backend timer thread based on isSimulating parameter
  if (updates.isSimulating !== undefined) {
    if (updates.isSimulating) {
      startBackendSimulation();
    } else {
      stopBackendSimulation();
    }
  }

  broadcastState();
  res.json(dbState.simulation);
});

// POST to reset database tree
app.post('/db/reset', (req, res) => {
  stopBackendSimulation();
  dbState = JSON.parse(JSON.stringify(INITIAL_DB));
  Object.keys(dbState.devices).forEach(key => {
    dbState.devices[key].lastToggled = new Date().toISOString();
  });
  broadcastState();
  res.json(dbState);
});

// Backend simulation thread
let simInterval = null;
const startBackendSimulation = () => {
  if (simInterval) return;
  simInterval = setInterval(() => {
    const keys = Object.keys(dbState.devices);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    dbState.devices[randomKey].status = !dbState.devices[randomKey].status;
    dbState.devices[randomKey].lastToggled = new Date().toISOString();
    broadcastState();
  }, 7000);
};

const stopBackendSimulation = () => {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
};

app.listen(PORT, () => {
  console.log(`Mock Production Firebase Server running at http://localhost:${PORT}`);
});
