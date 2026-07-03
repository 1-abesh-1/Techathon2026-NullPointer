require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');

const FIREBASE_URL = 'https://null-pointer-a3178-default-rtdb.firebaseio.com/.json';
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// ── Data fetching ──────────────────────────────────────────────

async function fetchDashboardData() {
  const res = await fetch(FIREBASE_URL);
  if (!res.ok) throw new Error(`Firebase returned ${res.status}`);
  return res.json();
}

// ── Room name → query name mapping ─────────────────────────────

const ROOM_ALIASES = {
  // Drawing Room
  'drawing': 'Drawing Room',
  'drawing room': 'Drawing Room',
  'dr': 'Drawing Room',
  // Work Room 1
  'work1': 'WorkRoom1',
  'work room 1': 'WorkRoom1',
  'workroom1': 'WorkRoom1',
  'wr1': 'WorkRoom1',
  // Work Room 2
  'work2': 'WorkRoom2',
  'work room 2': 'WorkRoom2',
  'workroom2': 'WorkRoom2',
  'wr2': 'WorkRoom2',
};

function resolveRoomName(input) {
  const key = input.trim().toLowerCase();
  if (ROOM_ALIASES[key]) return ROOM_ALIASES[key];
  // partial match
  for (const [alias, room] of Object.entries(ROOM_ALIASES)) {
    if (key.includes(alias) || alias.includes(key)) return room;
  }
  return null;
}

// ── Humanized response generation ──────────────────────────────

function getHour() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'morning';
  if (h >= 10 && h < 14) return 'afternoon';
  if (h >= 14 && h < 18) return 'evening';
  return 'night';
}

function timeGreeting() {
  const hour = getHour();
  const greetings = {
    morning: 'Good morning! ☀️',
    afternoon: 'Good afternoon! 🌤️',
    evening: 'Good evening! 🌆',
    night: 'Hey there! It\'s late — don\'t stay up too long! 🌙',
  };
  return greetings[hour];
}

function timeContext() {
  const hour = getHour();
  if (hour >= 20 || hour < 6) return "It's pretty late — hope everyone's winding down!";
  if (hour >= 18) return "Evening hours — time to head home?";
  if (hour >= 14) return "Afternoon slump — coffee break?";
  if (hour >= 10) return "Mid-morning — things are getting started!";
  return "Early bird hours!";
}

function deviceSummary(devices) {
  const onList = [];
  const offCount = { fans: 0, lights: 0 };
  let totalWatts = 0;

  for (const [name, dev] of Object.entries(devices)) {
    if (dev.isSwitchedOn) {
      onList.push(`${name}`);
      totalWatts += dev.watts || 0;
    } else {
      if (devices[name] && typeof devices[name] === 'object') {
        // nested — skip, handled below
      }
    }
  }

  // Count on/off by type
  let fanOn = 0, fanTotal = 0, lightOn = 0, lightTotal = 0;
  for (const [name, dev] of Object.entries(devices)) {
    if (name.startsWith('Fan') || name.startsWith('fan')) {
      fanTotal++;
      if (dev.isSwitchedOn) fanOn++;
    }
    if (name.startsWith('Light') || name.startsWith('light')) {
      lightTotal++;
      if (dev.isSwitchedOn) lightOn++;
    }
  }

  return { fanOn, fanTotal, lightOn, lightTotal, totalWatts, onList };
}

function friendlyDeviceList(onList) {
  if (onList.length === 0) return 'nothing is on';
  if (onList.length <= 3) return onList.join(', ');
  return `${onList.slice(0, 3).join(', ')} and ${onList.length - 3} more`;
}

// ── Command handlers ───────────────────────────────────────────

function handleStatus(data) {
  const greeting = timeGreeting();
  const lines = [];
  const rooms = data.rooms || {};

  for (const [roomName, roomData] of Object.entries(rooms)) {
    const parts = [];

    if (roomData.fans) {
      const fansOn = Object.values(roomData.fans).filter(f => f.isSwitchedOn).length;
      const fansTotal = Object.keys(roomData.fans).length;
      if (fansOn > 0) parts.push(`${fansOn} fan${fansOn > 1 ? 's' : ''} ON`);
      else parts.push('fans off');
    }

    if (roomData.lights) {
      const lightsOn = Object.values(roomData.lights).filter(l => l.isSwitchedOn).length;
      const lightsTotal = Object.keys(roomData.lights).length;
      if (lightsOn > 0) parts.push(`${lightsOn} light${lightsOn > 1 ? 's' : ''} ON`);
      else parts.push('lights off');
    }

    const status = parts.join(', ');
    lines.push(`\`${roomName}\`: ${status}`);
  }

  const totalWatts = Object.values(rooms).reduce((sum, room) => {
    let roomW = 0;
    for (const dev of Object.values(room.fans || {})) roomW += (dev.isSwitchedOn ? (dev.watts || 0) : 0);
    for (const dev of Object.values(room.lights || {})) roomW += (dev.isSwitchedOn ? (dev.watts || 0) : 0);
    return sum + roomW;
  }, 0);

  const footer = `⚡ Total power right now: ${totalWatts}W`;

  return {
    content: `${greeting}\n${lines.join('\n')}\n\n${timeContext()}\n\n${footer}`,
  };
}

function handleRoom(data, roomName) {
  const resolved = resolveRoomName(roomName);
  if (!resolved) {
    const available = Object.keys(ROOM_ALIASES).filter((_, i, a) =>
      a.indexOf(_) === i
    ).join(', ');
    return { content: `I couldn't find a room matching "${roomName}". Try: ${available}` };
  }

  const room = data.rooms?.[resolved];
  if (!room) return { content: `Hmm, I don't have data for \`${resolved}\` yet.` };

  const { fanOn, fanTotal, lightOn, lightTotal, totalWatts, onList } = deviceSummary({
    ...room.fans,
    ...room.lights,
  });

  let content = '';
  const greeting = timeGreeting();
  content += `${greeting} Here's \`${resolved}\`:\n\n`;

  if (fanOn === 0 && lightOn === 0) {
    content += `🔇 Everything's off — clean sweep! Nothing running right now.\n\n`;
  } else {
    if (fanOn > 0) content += `🌀 Fans: ${fanOn}/${fanTotal} ON\n`;
    if (lightOn > 0) content += `💡 Lights: ${lightOn}/${lightTotal} ON\n`;
    content += `\nRunning devices: ${friendlyDeviceList(onList)}\n`;
    content += `\n⚡ Power draw: ${totalWatts}W\n`;
  }

  const hour = getHour();
  if (fanOn + lightOn > 0 && (hour >= 20 || hour < 6)) {
    content += `\n⏰ It's late — double-check everything's off before you leave!`;
  }

  return { content };
}

function handleUsage(data) {
  const greeting = timeGreeting();
  const rooms = data.rooms || {};

  let totalWatts = 0;
  for (const room of Object.values(rooms)) {
    for (const dev of Object.values(room.fans || {})) {
      if (dev.isSwitchedOn) totalWatts += dev.watts || 0;
    }
    for (const dev of Object.values(room.lights || {})) {
      if (dev.isSwitchedOn) totalWatts += dev.watts || 0;
    }
  }

  const dailyWh = data.dailyUsageWh || 0;
  const dailyKwh = (dailyWh / 1000).toFixed(2);

  let content = `${greeting} Power report:\n\n`;
  content += `⚡ **Current power draw:** ${totalWatts}W\n`;
  content += `📊 **Today's estimated usage:** ${dailyKwh} kWh (${dailyWh.toFixed(2)} Wh)\n`;

  // Estimate monthly
  const estMonthly = (dailyWh * 30 / 1000).toFixed(1);
  content += `\n📅 Projected monthly: ~${estMonthly} kWh\n`;

  const hour = getHour();
  if (hour >= 18) {
    content += `\n🌆 Evening hours — consider turning off unused devices to save on that bill!`;
  } else if (hour >= 10) {
    content += `\n☕ Midday check — looks like things are humming along!`;
  }

  return { content };
}

// ── Alert system ───────────────────────────────────────────────

let lastAlertState = null;

function checkAlerts(data) {
  const rooms = data.rooms || {};
  const alerts = [];

  for (const [roomName, roomData] of Object.entries(rooms)) {
    const fansOn = Object.values(roomData.fans || {}).filter(f => f.isSwitchedOn).length;
    const lightsOn = Object.values(roomData.lights || {}).filter(l => l.isSwitchedOn).length;
    const totalOn = fansOn + lightsOn;
    const hour = getHour();

    // Alert: devices left on during late hours (10 PM - 6 AM)
    if (totalOn > 0 && (hour >= 22 || hour < 6)) {
      const devices = [];
      if (fansOn > 0) devices.push(`${fansOn} fan${fansOn > 1 ? 's' : ''}`);
      if (lightsOn > 0) devices.push(`${lightsOn} light${lightsOn > 1 ? 's' : ''}`);
      alerts.push({
        room: roomName,
        message: `⚠️ *Hey! \`${roomName}\` still has ${devices.join(' and ')} ON and it's late. Did someone forget to leave?*`,
      });
    }

    // Alert: devices left on during work hours but no one should be there (10 PM - 6 AM)
    if (totalOn > 2 && (hour >= 20 || hour < 6)) {
      alerts.push({
        room: roomName,
        message: `🚨 *\`${roomName}\` has ${totalOn} devices running — that's a lot for this hour! Double-check everything.*`,
      });
    }
  }

  return alerts;
}

// ── Register commands ──────────────────────────────────────────

client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);

  // Register slash commands globally
  const commands = [
    {
      name: 'status',
      description: 'Show status of all rooms',
    },
    {
      name: 'room',
      description: 'Show status of a specific room',
      options: [
        {
          type: 3, // STRING
          name: 'name',
          description: 'Room name (e.g., work1, drawing)',
          required: true,
        },
      ],
    },
    {
      name: 'usage',
      description: 'Show power usage statistics',
    },
  ];

  try {
    await client.application.commands.set(commands);
    console.log('✅ Slash commands registered');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }

  // Start alert monitoring
  setInterval(async () => {
    try {
      const data = await fetchDashboardData();
      const alerts = checkAlerts(data);

      if (alerts.length > 0) {
        const channel = client.channels.cache.get(process.env.ALERT_CHANNEL_ID);
        if (channel) {
          for (const alert of alerts) {
            await channel.send(alert.message);
          }
        }
      }
    } catch (err) {
      // Silently fail — don't spam errors
    }
  }, 60000); // Check every minute
});

// ── Message command handler ────────────────────────────────────

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  try {
    const data = await fetchDashboardData();

    switch (command) {
      case 'status': {
        const result = handleStatus(data);
        await message.reply(result.content);
        break;
      }
      case 'room': {
        const roomName = args.join(' ');
        if (!roomName) {
          await message.reply('Usage: `!room <name>` — e.g., `!room work1` or `!room drawing`');
          return;
        }
        const result = handleRoom(data, roomName);
        await message.reply(result.content);
        break;
      }
      case 'usage': {
        const result = handleUsage(data);
        await message.reply(result.content);
        break;
      }
      default:
        await message.reply(`Unknown command. Try \`!status\`, \`!room <name>\`, or \`!usage\`.`);
    }
  } catch (err) {
    await message.reply('❌ Sorry, I couldn\'t fetch the latest data. The Firebase service might be down.');
    console.error('Command error:', err);
  }
});

// ── Slash command handler ──────────────────────────────────────

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  try {
    const data = await fetchDashboardData();

    switch (command) {
      case 'status': {
        const result = handleStatus(data);
        await interaction.reply(result.content);
        break;
      }
      case 'room': {
        const roomName = interaction.options.getString('name');
        const result = handleRoom(data, roomName);
        if (result.content.startsWith('I couldn\'t find') || result.content.startsWith('Hmm')) {
          await interaction.reply(result.content);
        } else {
          await interaction.reply(result.content);
        }
        break;
      }
      case 'usage': {
        const result = handleUsage(data);
        await interaction.reply(result.content);
        break;
      }
    }
  } catch (err) {
    await interaction.reply('❌ Sorry, I couldn\'t fetch the latest data.');
    console.error('Slash command error:', err);
  }
});

// ── Start ──────────────────────────────────────────────────────

client.login(process.env.DISCORD_TOKEN);
