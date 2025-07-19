import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for ES modules to use __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is missing in environment variables');
}

// Setup LowDB
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

// Default structure if db is empty
await db.read();
db.data ||= { users: {} };
await db.write();

// Express server for Render to detect an open port
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => {
  res.send('Celestial Spin Bot is live 🚀');
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// Setup Telegram Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log('✅ Bot is running and polling Telegram...');

// Constants
const COOLDOWN_MINUTES = 240;
const MIN_REWARD = 100;
const MAX_REWARD = 1000;

// Helper function to format remaining time
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// Handlers
bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id.toString();
  console.log('/start received from', userId);

  await db.read();
  db.data.users[userId] ||= {
    balance: 0,
    lastSpin: 0,
  };
  await db.write();

  const message = `🌌 Welcome to Celestial Spin!\n\nEarn EARTH tokens every 4 hours by spinning the cosmic wheel.\n\nTrack your token balance, next spin time, and milestones on the live dashboard.\n\nUse /spin to start spinning!`;
  bot.sendMessage(msg.chat.id, message);
});

bot.onText(/\/spin/, async (msg) => {
  const userId = msg.from.id.toString();
  console.log(`/spin from ${userId}`);

  await db.read();
  db.data.users[userId] ||= { balance: 0, lastSpin: 0 };

  const now = Date.now();
  const lastSpin = db.data.users[userId].lastSpin;
  const diff = now - lastSpin;
  const cooldown = COOLDOWN_MINUTES * 60 * 1000;

  if (diff < cooldown) {
    const timeLeft = formatTime(cooldown - diff);
    bot.sendMessage(msg.chat.id, `⏳ You can spin again in ${timeLeft}.`);
    console.log(`/spin from ${userId} — on cooldown (${COOLDOWN_MINUTES - Math.floor(diff / 60000)} min left)`);
    return;
  }

  // Generate reward and update data
  const reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;
  db.data.users[userId].balance += reward;
  db.data.users[userId].lastSpin = now;
  await db.write();

  bot.sendMessage(msg.chat.id, `🎉 You earned ${reward} EARTH tokens!\n\nNext spin available in 4 hours.`);
  console.log(`/spin from ${userId} — earned ${reward} tokens`);
});

bot.onText(/\/balance/, async (msg) => {
  const userId = msg.from.id.toString();
  await db.read();
  const balance = db.data.users[userId]?.balance || 0;
  bot.sendMessage(msg.chat.id, `💰 Your current balance is ${balance} EARTH tokens.`);
});

