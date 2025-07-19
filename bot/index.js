import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import pkg from 'lowdb';
const { Low, JSONFile } = pkg;

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Setup DB
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
await db.read();
db.data ||= { users: {} };

// Setup Telegram Bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log('✅ BOT_TOKEN loaded:', !!process.env.BOT_TOKEN);
console.log('🤖 Bot is running and polling Telegram...');

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  if (!db.data.users[chatId]) {
    db.data.users[chatId] = { tokens: 0, lastSpin: 0 };
    await db.write();
  }

  bot.sendMessage(chatId, `🌌 Welcome to Celestial Spin!

Earn EARTH tokens every 4 hours by spinning the cosmic wheel.

Track your token balance, next spin time, and milestones on the live dashboard.

Use /spin to start spinning!`);
});

bot.onText(/\/spin/, async (msg) => {
  const chatId = msg.chat.id;
  const user = db.data.users[chatId];

  const now = Date.now();
  const cooldown = 4 * 60 * 60 * 1000;

  if (now - user.lastSpin < cooldown) {
    const minutesLeft = Math.ceil((cooldown - (now - user.lastSpin)) / 60000);
    bot.sendMessage(chatId, `⏳ You can spin again in ${minutesLeft} minutes.`);
    return;
  }

  const earned = Math.floor(Math.random() * 901 + 100);
  user.tokens += earned;
  user.lastSpin = now;
  await db.write();

  bot.sendMessage(chatId, `🌀 You earned ${earned} EARTH tokens!`);
});

// HTTP server to keep Render service alive
app.get('/', (req, res) => {
  res.send('Celestial Spin Bot is alive!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
});

