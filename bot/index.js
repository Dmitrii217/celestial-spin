import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Setup DB
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);
await db.read();
db.data ||= { users: {} };
await db.write();

// Bot setup
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Cooldown time: 4 hours
const COOLDOWN_MS = 4 * 60 * 60 * 1000;

// Web dashboard URL
const DASHBOARD_URL = 'https://celestialspingood.netlify.app';

// Express server to keep Render service alive
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Celestial Spin Bot is live'));
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

console.log('✅ Loading BOT_TOKEN:', !!token);
console.log('🤖 Bot is running and polling Telegram...');

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'Explorer';
  await db.read();

  if (!db.data.users[chatId]) {
    db.data.users[chatId] = { balance: 0, lastSpin: 0 };
    await db.write();
  }

  bot.sendMessage(chatId, `🌌 Welcome to Celestial Spin!

Earn EARTH tokens every 4 hours by spinning the cosmic wheel.

Track your token balance, next spin time, and milestones on the live dashboard:
${DASHBOARD_URL}

Use /spin to start spinning!`);
});

bot.onText(/\/spin/, async (msg) => {
  const chatId = msg.chat.id;
  const now = Date.now();
  await db.read();

  const user = db.data.users[chatId] ||= { balance: 0, lastSpin: 0 };
  const nextSpin = user.lastSpin + COOLDOWN_MS;

  if (now < nextSpin) {
    const msLeft = nextSpin - now;
    const minsLeft = Math.ceil(msLeft / 60000);
    return bot.sendMessage(chatId, `⏳ You can spin again in ${minsLeft} minutes.`);
  }

  const reward = Math.floor(Math.random() * 901) + 100; // 100–1000
  user.balance += reward;
  user.lastSpin = now;
  await db.write();

  bot.sendMessage(chatId, `🔁 You spun the cosmic wheel and earned ${reward} EARTH tokens! 🌍

Check your balance and progress: ${DASHBOARD_URL}`);
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  await db.read();
  const user = db.data.users[chatId] ||= { balance: 0, lastSpin: 0 };
  bot.sendMessage(chatId, `🌍 Your current balance: ${user.balance} EARTH tokens.`);
});

