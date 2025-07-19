Paste this:
# 🌌 Celestial Spin

**Celestial Spin** is a gamified Web3 onboarding experience. Spin every 4 hours to collect 🌍 EARTH tokens and journey through the solar system toward cosmic milestones.

![screenshot](https://via.placeholder.com/800x400?text=Celestial+Spin+Dashboard)

---

## 🚀 Features

- 🔁 Spin every 4 hours
- 🎰 Random token rewards (100–1000 EARTH)
- 🌍 Live Telegram bot integration
- 📊 Web dashboard with token tracker and milestones
- 🛸 Persistent progress with LowDB

---

## 📦 Folder Structure

celestial-spin/
├── bot/ # Telegram bot with spin logic
├── backend/ # Express API server
├── frontend/ # React dashboard (Vite)
└── db.json # Shared lowdb database


---

## 📱 Telegram Bot

Start the bot:  
```bash
cd bot
npm install
BOT_TOKEN=your_bot_token_here npm start
Use these commands:

/start — Welcome message
/spin — Earn tokens (4h cooldown)
/balance — Check your balance
🧠 Frontend

Start the dashboard:

cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser.

🌐 Backend

Start the API server:

cd backend
npm install
npm start
Runs on: http://localhost:4000
Example: /api/balance/806916617

🪐 Milestones

Milestone	Tokens	Emoji
Moon	1	🌕
Sun	1000	☀️
Pluto	39500	❄️
V774104	100000	🌌
(Full list inside the dashboard)

🛠 Tech Stack

Node.js, Express, Telegram Bot API
React + Vite
LowDB (local JSON storage)
🧪 Coming Soon

🎨 Space-themed animations
🔗 Web3 wallet connection
🛰️ Leaderboards
👽 License

MIT — build your own universe.


### ✅ Save it and commit:

```bash
git add README.md
git commit -m "Add project README"
git push
