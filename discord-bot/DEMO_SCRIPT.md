# Discord Bot Demo Video Script (30-45 seconds)

---

## QUICK OVERVIEW

Your bot is a **real-time office monitoring Discord bot** that connects Firebase (live sensor data from ESP32 devices) to a Discord channel. Users can query room status, power consumption, and device uptime using simple text commands.

---

## SCRIPT (Choose one version)

### VERSION A — Natural Walkthrough (~40 sec) — RECOMMENDED

| Time | Visual | Voiceover |
|------|--------|-----------|
| 0-3s | Discord channel with bot name visible | "This is the Null Pointer Discord bot — our office monitoring system, right in Discord." |
| 3-10s | Type `!status` → show response | "With one command, `!status`, you get the on/off state of every fan and light across all rooms, plus total power draw." |
| 10-18s | Type `!room work1` → show detailed response | "For a specific room, `!room work1` gives you a detailed breakdown — how many fans and lights are running, what's currently on, and the exact wattage." |
| 18-26s | Type `!usage` → show power report | "`!usage` shows today's estimated energy consumption and a projected monthly total — so you always know your power bill before it arrives." |
| 26-34s | Type `!overdue` → show flagged devices | "And `!overdue` flags any device left on for more than 4 hours — because nobody wants to come back to a hot office." |
| 34-40s | Show automated alert message (purple embed) | "Plus, the bot automatically detects devices left on during late hours and posts alerts — all without anyone asking." |
| 40-45s | Wide shot of all commands listed | "Real-time data from ESP32 sensors, flowing through Firebase, into Discord. Simple commands, powerful insights." |

---

### VERSION B — Fast-Paced (~30 sec)

| Time | Visual | Voiceover |
|------|--------|-----------|
| 0-3s | Discord channel | "Meet the Null Pointer Discord bot — office monitoring, no app needed." |
| 3-9s | Quick typing: `!status` | "`!status` — live room-by-room device status and total wattage." |
| 9-15s | Quick typing: `!room lr` | "`!room lr` — deep dive into any room's devices and power draw." |
| 15-21s | Quick typing: `!usage` | "`!usage` — daily and projected monthly energy consumption." |
| 21-27s | Quick typing: `!uptime` | "`!uptime` — how long each device has been in its current state." |
| 27-30s | Show all commands + Firebase connection | "ESP32 sensors → Firebase → Discord. Real-time monitoring, zero friction." |

---

### VERSION C — Story-Driven (~45 sec)

| Time | Visual | Voiceover |
|------|--------|-----------|
| 0-5s | Show the Discord channel empty, then bot comes online | "Imagine walking into your office and wondering — did someone leave the AC running last night?" |
| 5-12s | Type `!status` | "Just type `!status` in Discord. Instantly, you see every room's device status and total power draw." |
| 12-20s | Type `!room work2` | "Drill into any room with `!room work2` — fans, lights, wattage, even what's currently switched on." |
| 20-28s | Type `!usage` | "Check energy usage with `!usage` — today's consumption, projected monthly cost. All estimated from real-time sensor data." |
| 28-36s | Type `!overdue` → show results | "And `!overdue` catches devices left on too long — automatic late-night alerts keep things in check." |
| 36-45s | Show architecture: ESP32 → Firebase → Discord | "It all starts with ESP32 sensors feeding Firebase in real-time. The bot reads that data and serves it through simple Discord commands. No app to install. No dashboard to open. Just ask." |

---

## DEMO FLOW (Step-by-Step Recording Order)

Record your screen in this exact sequence for maximum impact:

### Step 1 — Bot Online (2-3 sec)
- Show the Discord channel where the bot is active
- Ideally show the bot's "online" status or an "I'm online" message
- **Tip:** Have the bot's presence visible — it builds credibility

### Step 2 — `!status` Command (5-7 sec)
- Type `!status` in the Discord input
- Wait for the response to render fully
- **Highlight:** The greeting changes based on time of day, room-by-room breakdown, total wattage footer

### Step 3 — `!room <name>` Command (5-7 sec)
- Type `!room work1` (or any room)
- Show the detailed response with fan/light counts, running devices list, and wattage
- **Highlight:** The friendly device list ("Fan 1, Fan 2, and 1 more")

### Step 4 — `!usage` Command (5-7 sec)
- Type `!usage`
- Show current power draw, daily kWh, and projected monthly
- **Highlight:** The monthly projection is a strong "wow" moment

### Step 5 — `!overdue` or `!uptime` Command (5-7 sec)
- Type `!overdue` to show flagged devices
- OR type `!uptime` to show duration since last toggle
- **Highlight:** This is the "smart" feature that shows proactive monitoring

### Step 6 — Automated Alert (3-5 sec)
- Scroll to show an automated alert message from the bot (purple embed)
- **Highlight:** This requires NO user input — it's autonomous

---

## RECORDING TIPS

### Screen Recording
1. **Resolution:** Record at 1920x1080 or your native resolution
2. **Zoom:** Set Discord to 110-125% zoom so text is readable in the video
3. **Cursor:** Slow down your mouse movements — fast typing looks messy
4. **Type each command** (don't paste) — it looks more professional and shows familiarity

### Audio
1. **Quiet room** — record in a silent environment
2. **Speak clearly and slightly slower** than normal conversation
3. **Practice once** before recording — smooth delivery matters more than perfect script memorization
4. **Smile while speaking** — it subtly changes your tone to sound more engaging

### Visual Polish
1. **Dark mode** in Discord (looks more professional/techy)
2. **Close unnecessary tabs** — keep focus on Discord
3. **Hide notifications** — turn on Do Not Disturb mode
4. **Have Firebase console open** in another tab — briefly show it during the architecture explanation
5. **Bot response ready** — if a command takes time to load, have a backup response screenshot

### Pacing
- **Don't rush** — it's better to be slightly under 30 sec than a rushed 45 sec
- **Pause between commands** — let each response fully render before moving on
- **Natural pauses** are fine — they make the video feel more authentic

---

## ALTERNATIVE: NO-VOICEOVER VERSION

If you prefer a text-based demo without voiceover:

1. Record screen with commands being typed
2. Add **text overlays** (using CapCut, Canva, or similar) for each command's purpose
3. Use **arrows/highlights** to draw attention to key parts of bot responses
4. Add **background music** (low volume, royalty-free)
5. End with an **architecture diagram** slide

---

## KEY HIGHLIGHTS TO EMPHASIZE

| Feature | Why It Matters |
|---------|---------------|
| **Natural language aliases** | `!room work1`, `!room drawing`, `!room lr` — all work. No memorization needed. |
| **Time-aware responses** | Bot greets differently based on time of day — shows personality |
| **Real-time Firebase sync** | Data is live from ESP32 sensors, not cached |
| **Automated alerts** | Proactive monitoring — no command needed |
| **Zero setup for users** | Anyone in the Discord server can use it — no app install |
| **Power insights** | Daily + monthly projections from real sensor data |

---

## QUICK REFERENCE: ALL BOT COMMANDS

| Command | Description |
|---------|-------------|
| `!status` | Room-by-room device status + total wattage |
| `!room <name>` | Detailed room info (supports aliases: work1, drawing, lr, etc.) |
| `!usage` | Current power draw, daily kWh, projected monthly |
| `!uptime` | How long each device has been in current state |
| `!energy` | Energy consumed per device since last toggle |
| `!overdue` | Devices on for more than 4 hours |
| `!top` | Rooms ranked by current wattage draw |

---

## SUGGESTED B-ROLL / CUTAWAYS

If you want to add visual variety:

1. **Firebase console** — Show the live data structure briefly (1-2 sec)
2. **ESP32 schematic** — Show the hardware side of the system
3. **Architecture diagram** — ESP32 → Firebase → Discord Bot → Users
4. **Code snippet** — Show the command parsing logic (just 3-4 lines)

---

## FINAL CHECKLIST

- [ ] Discord is in dark mode
- [ ] Bot is online and responsive
- [ ] Test all commands before recording
- [ ] Screen resolution is 1080p+
- [ ] Discord zoom is at 110-125%
- [ ] Do Not Disturb mode is ON
- [ ] Close unnecessary tabs/apps
- [ ] Practice voiceover once
- [ ] Record in a quiet room
- [ ] Have a backup: screenshot of each command's response

---

*Good luck with your demo! The bot is solid — just show it naturally and let the commands speak for themselves.*
