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

// Async IIFE to initialize bot and DB
(async () => {
  await db.read();
  db.data ||= { users: {} };

  const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

  console.log('✅ BOT_TOKEN loaded:', !!process.env.BOT_TOKEN);
  console.log('🤖 Bot is running and polling Telegram...');

  // 🌟 Helper: Send persistent keyboard with dashboard link
  const sendDashboardKeyboard = (chatId) => {
    const dashboardUrl = `https://celestial-dashboard.netlify.app/?tgId=${chatId}`;
    bot.sendMessage(chatId, `📊 Tap the button below to open your live dashboard`, {
      reply_markup: {
        keyboard: [
          [
            {
              text: '📊 View Dashboard',
              web_app: { url: dashboardUrl }
            }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  };

  // ✅ /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Explorer';

    if (!db.data.users[chatId]) {
      db.data.users[chatId] = { tokens: 0, lastSpin: 0 };
      await db.write();
    }

    await bot.sendMessage(chatId, `🌌 Welcome to Celestial Spin, ${firstName}!

Earn EARTH tokens every 4 hours by spinning the cosmic wheel.  
Use /spin to start spinning!

Track your tokens, cooldown, and milestones on the live dashboard.`);
    
    sendDashboardKeyboard(chatId);
  });

  // ✅ /spin command
  bot.onText(/\/spin/, async (msg) => {
    const chatId = msg.chat.id;
    let user = db.data.users[chatId];

    if (!user) {
      db.data.users[chatId] = { tokens: 0, lastSpin: 0 };
      user = db.data.users[chatId];
      await db.write();
    }

    const now = Date.now();
    const cooldown = 4 * 60 * 60 * 1000; // 4 hours in ms

    if (now - user.lastSpin < cooldown) {
      const minutesLeft = Math.ceil((cooldown - (now - user.lastSpin)) / 60000);
      bot.sendMessage(chatId, `⏳ You can spin again in ${minutesLeft} minutes.`);
      return;
    }

    const earned = Math.floor(Math.random() * 901 + 100); // 100–1000
    user.tokens += earned;
    user.lastSpin = now;
    await db.write();

    await bot.sendMessage(chatId, `🎉 You spun the cosmic wheel and earned *${earned}* EARTH tokens!`, {
      parse_mode: 'Markdown'
    });

    sendDashboardKeyboard(chatId);
  });

  // ✅ Keep-alive endpoint for Render
  app.get('/', (req, res) => {
    res.send('🌍 Celestial Spin Bot is alive and spinning!');
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP server listening on port ${PORT}`);
  });
})();

