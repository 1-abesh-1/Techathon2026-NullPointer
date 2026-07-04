# Null Pointer Discord Bot

A Discord bot for the **Null Pointer** office monitoring system. It reads real-time device data from Firebase and provides room status, power usage reports, and automated alerts via text commands.

## Features

- **`!status`** — Show the on/off status of fans and lights across all rooms, plus total power draw.
- **`!room <name>`** — Get detailed info for a specific room (supports aliases like `work1`, `drawing`, `lr`, etc.).
- **`!usage`** — View current power draw, today's estimated kWh, and projected monthly usage.
- **`!uptime`** — See how long each device has been in its current state (ON/OFF).
- **`!energy`** — Estimate energy consumed per device since it was last toggled.
- **`!overdue`** — Flag devices that have been on for more than 4 hours.
- **`!top`** — Power rankings of rooms sorted by current wattage draw.
- **Automated alerts** — Detects devices left on during late hours (10 PM – 6 AM) and posts warnings to the configured alert channel.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Discord Bot](https://discordjs.guide/preliminary/setting-up-bot-app.html) with the following intents enabled:
  - `Guilds`
  - `GuildMessages`
  - `MessageContent`
- A Firebase Realtime Database URL

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create a `.env` file** in this directory with the following variables:

   ```env
   DISCORD_TOKEN=your_bot_token_here
   ALERT_CHANNEL_ID=your_alert_channel_id_here
   ```

   - `DISCORD_TOKEN` — Your Discord bot token from the [Discord Developer Portal](https://discord.com/developers/applications).
   - `ALERT_CHANNEL_ID` — The Discord channel ID where automated alerts should be posted.

3. **Start the bot:**

   ```bash
   npm start          # Production mode
   npm run dev        # Development mode (auto-restart on file changes)
   ```

## Bot Commands

Use these commands in any Discord text channel:

| Command | Description | Example |
|---------|-------------|---------|
| `!status` | Show status of all rooms | `!status` |
| `!room` | Show status of a specific room | `!room work1` |
| `!usage` | Show power usage statistics | `!usage` |
| `!uptime` | Show how long each device has been on/off | `!uptime` |
| `!energy` | Estimate energy consumed per device | `!energy` |
| `!overdue` | Flag devices on for >4 hours | `!overdue` |
| `!top` | Power rankings of rooms | `!top` |

### Room Name Aliases

The `!room` command accepts multiple aliases:

| Alias | Maps To |
|-------|---------|
| `living`, `lr` | Living Room |
| `work1`, `wr1` | Work Room 1 |
| `work2`, `wr2` | Work Room 2 |

## Project Structure

```
discord-bot/
├── bot.js          # Main bot entry point
├── package.json    # Dependencies and scripts
├── .env            # Environment variables (not committed)
└── README.md
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `discord.js` | ^14.16.0 | Discord API wrapper |
| `dotenv` | ^16.4.0 | Load environment variables from `.env` |

## Firebase Integration

The bot reads device data from the Firebase Realtime Database at:

```
https://null-pointer-a3178-default-rtdb.firebaseio.com/.json
```

Expected data structure:

```json
{
  "rooms": {
    "Living Room": {
      "fans": { "Fan1": { "isSwitchedOn": true, "watts": 75 } },
      "lights": { "Light1": { "isSwitchedOn": false, "watts": 60 } }
    },
    "WorkRoom1": { ... },
    "WorkRoom2": { ... }
  },
  "dailyUsageWh": 1234.56
}
```

## License

MIT
