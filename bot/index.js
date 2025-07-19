import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import { Low, JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

// === Setup paths for ESM ===
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter);

// === Load default data if empty ===
await db.read();
db.data ||= { users: {} };

// === Telegram bot setup ===
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// === Constants ===
const COOLDOWN_HOURS = 4;
const MS_IN_HOUR = 60 * 60 * 1000;

// === Helper Functions ===
const getUser = (userId) => {
  db.data.users[userId] ||= {
    tokens: 0,
    lastSpin: 0,
  };
  return db.data.users[userId];
};

const getRemainingCooldown = (lastSpin) => {
  const now = Date.now();
  const nextSpinTime = lastSpin + COOLDOWN_HOURS * MS_IN_HOUR;
  return Math.max(nextSpinTime - now, 0);
};

const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
};

// === Bot Commands ===

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  getUser(chatId);
  await db.write();

  bot.sendMessage(
    chatId,
    `🌌 Welcome to Celestial Spin!\n\nEarn EARTH tokens every 4 hours by spinning the cosmic wheel.\n\nTrack your token balance, next spin time, and milestones on the live dashboard.\n\nUse /spin to start spinning!`
  );
});

bot.onText(/\/spin/, async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);
  const cooldown = getRemainingCooldown(user.lastSpin);

  if (cooldown > 0) {
    bot.sendMessage(
      chatId,
      `⏳ You can spin again in ${formatTime(cooldown)}.`
    );
    return;
  }

  const reward = Math.floor(Math.random() * 901) + 100; // 100–1000
  user.tokens += reward;
  user.lastSpin = Date.now();
  await db.write();

  bot.sendMessage(
    chatId,
    `🎉 You spun the cosmic wheel and earned ${reward} EARTH tokens!\n\nUse /balance to check your progress.`
  );
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);
  await db.write();

  const cooldown = getRemainingCooldown(user.lastSpin);
  const cooldownText =
    cooldown > 0
      ? `⏳ Next spin in ${formatTime(cooldown)}`
      : `✅ You can spin now!`;

  bot.sendMessage(
    chatId,
    `🪐 Balance: ${user.tokens} EARTH\n${cooldownText}\n\nLive dashboard: https://celestialspingood.netlify.app`
  );
});

// === Web Server for Render (required) ===
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Celestial Spin Bot is running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

