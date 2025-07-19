import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

// Load environment variables from .env
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Error: BOT_TOKEN is not defined in .env');
  process.exit(1);
}

// Setup LowDB for storage
const file = path.join(process.cwd(), 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();
db.data ||= { users: {} };

// Initialize Telegram Bot with polling
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Cooldown period in milliseconds (4 hours)
const COOLDOWN = 4 * 60 * 60 * 1000;

function getUserData(userId) {
  if (!db.data.users[userId]) {
    db.data.users[userId] = {
      balance: 0,
      lastSpin: 0,
    };
  }
  return db.data.users[userId];
}

function saveDB() {
  return db.write();
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, `🌌 Welcome to Celestial Spin!\nUse /spin to earn EARTH tokens every 4 hours.`);
});

bot.onText(/\/spin/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = String(chatId);

  await db.read();

  const userData = getUserData(userId);
  const now = Date.now();

  if (now - userData.lastSpin < COOLDOWN) {
    const remainingMs = COOLDOWN - (now - userData.lastSpin);
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    await bot.sendMessage(chatId, `⏳ You can spin again in ${hours}h ${minutes}m ${seconds}s.`);
    return;
  }

  // Spin reward: random tokens between 100 and 1000
  const earnedTokens = Math.floor(Math.random() * 901) + 100;

  userData.balance += earnedTokens;
  userData.lastSpin = now;

  await saveDB();

  await bot.sendMessage(chatId, `🎉 You spun and earned ${earnedTokens} EARTH tokens!\nYour balance is now ${userData.balance} EARTH tokens.`);
});

// For your backend API server (optional)
// If you are not running an express or http server here, just skip this part
// If you have it, make sure to listen on 0.0.0.0 and process.env.PORT

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Celestial Spin bot backend is running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API server running on port ${PORT}`);
});

