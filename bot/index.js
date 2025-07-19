import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { Low, JSONFile } from 'lowdb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Setup LowDB with JSONFile adapter
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

(async () => {
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

    const dashboardUrl = `https://celestial-spin.netlify.app/?id=${chatId}`;

    bot.sendMessage(chatId, `🌌 Welcome to Celestial Spin!

Earn EARTH tokens every 4 hours by spinning the cosmic wheel.

Track your token balance, next spin time, and milestones on the live dashboard.

Use /spin to start spinning!`, {
      reply_markup: {
        inline_keyboard: [[
          { text: '📊 View Dashboard', url: dashboardUrl }
        ]]
      }
    });
  });

  bot.onText(/\/spin/, async (msg) => {
    const chatId = msg.chat.id;
    let user = db.data.users[chatId];

    if (!user) {
      db.data.users[chatId] = { tokens: 0, lastSpin: 0 };
      user = db.data.users[chatId];
      await db.write();
    }

    const now = Date.now();
    const cooldown = 4 * 60 * 60 * 1000; // 4 hours cooldown

    if (now - user.lastSpin < cooldown) {
      const minutesLeft = Math.ceil((cooldown - (now - user.lastSpin)) / 60000);
      bot.sendMessage(chatId, `⏳ You can spin again in ${minutesLeft} minutes.`);
      return;
    }

    const earned = Math.floor(Math.random() * 901 + 100); // random between 100-1000 tokens
    user.tokens += earned;
    user.lastSpin = now;
    await db.write();

    const dashboardUrl = `https://celestial-spin.netlify.app/?id=${chatId}`;

    bot.sendMessage(chatId, `🌀 You earned ${earned} EARTH tokens!`, {
      reply_markup: {
        inline_keyboard: [[
          { text: '📊 View Dashboard', url: dashboardUrl }
        ]]
      }
    });
  });

  // Simple HTTP server to keep alive or add API endpoints
  app.get('/', (req, res) => {
    res.send('Celestial Spin Bot is alive!');
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP server listening on port ${PORT}`);
  });
})();

