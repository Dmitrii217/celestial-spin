import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch'; // install if needed: npm install node-fetch@2
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const BACKEND_URL = process.env.BACKEND_URL;

console.log('✅ BOT_TOKEN loaded:', !!process.env.BOT_TOKEN);
console.log('🌐 Using backend URL:', BACKEND_URL);

// Helper: fetch user data from backend
async function getUserData(userId) {
  const res = await fetch(`${BACKEND_URL}/api/balance/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user data');
  return await res.json();
}

// Helper: call backend to add tokens for user (simulate spin reward)
async function spinUser(userId, earnedTokens) {
  // Your backend currently does not have POST endpoint to add tokens,
  // so for now, you will need to implement it or handle spins inside backend.
  // As a quick workaround, we will call backend GET and assume tokens update elsewhere.

  // Ideally, implement POST /api/spin endpoint on backend to handle spins.

  // For demonstration, just fetch user data:
  return getUserData(userId);
}

// Send dashboard keyboard
function sendDashboardKeyboard(chatId) {
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
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'Explorer';

  await bot.sendMessage(chatId, `🌌 Welcome to Celestial Spin, ${firstName}!

Earn EARTH tokens every 4 hours by spinning the cosmic wheel.  
Use /spin to start spinning!

Track your tokens, cooldown, and milestones on the live dashboard.`);

  sendDashboardKeyboard(chatId);
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const data = await getUserData(chatId);
    const now = Date.now();
    const cooldownMs = data.cooldown * 1000;
    const nextSpinTime = now + cooldownMs;

    let cooldownText = '';
    if (data.cooldown > 0) {
      const hours = Math.floor(data.cooldown / 3600);
      const minutes = Math.floor((data.cooldown % 3600) / 60);
      cooldownText = `🕒 Next spin in: ${hours}h ${minutes}m`;
    } else {
      cooldownText = `✅ You can spin now! Use /spin`;
    }

    await bot.sendMessage(chatId, `🌍 Your EARTH token balance: *${data.balance}*  
${cooldownText}`, { parse_mode: 'Markdown' });

    sendDashboardKeyboard(chatId);
  } catch (err) {
    console.error('Error in /balance:', err);
    bot.sendMessage(chatId, '❌ Failed to fetch your balance. Please try again later.');
  }
});

bot.onText(/\/spin/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    // Fetch current user data from backend
    const userData = await getUserData(chatId);

    const cooldownSeconds = userData.cooldown;
    if (cooldownSeconds > 0) {
      const minutesLeft = Math.ceil(cooldownSeconds / 60);
      await bot.sendMessage(chatId, `⏳ You can spin again in ${minutesLeft} minutes.`);
      return;
    }

    // Spin logic: generate earned tokens (100-1000)
    const earned = Math.floor(Math.random() * 901 + 100);

    // Now you must send this spin reward to backend to update balance & lastSpin
    // But backend doesn't have POST /spin, so you need to implement it.
    // For now, simulate it by calling a backend endpoint or handle spins fully on backend.

    // === You must add this endpoint on backend ===
    const spinResponse = await fetch(`${BACKEND_URL}/api/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: chatId, tokens: earned }),
    });

    if (!spinResponse.ok) {
      throw new Error('Spin failed on backend');
    }

    const updatedUser = await spinResponse.json();

    await bot.sendMessage(chatId, `🎉 You spun the cosmic wheel and earned *${earned}* EARTH tokens!`, {
      parse_mode: 'Markdown',
    });

    sendDashboardKeyboard(chatId);
  } catch (err) {
    console.error('Error in /spin:', err);
    bot.sendMessage(chatId, '❌ Spin failed. Please try again later.');
  }
});

// Keep-alive endpoint if needed
import express from 'express';
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (_, res) => res.send('🌍 Celestial Spin Bot is alive!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Bot HTTP server running on port ${PORT}`));

