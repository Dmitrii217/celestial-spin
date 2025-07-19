import TelegramBot from 'node-telegram-bot-api';
import { Low, JSONFile } from 'lowdb';
import path from 'path';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN not set in environment variables");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Setup LowDB for simple JSON storage
const file = path.resolve('./db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();
db.data ||= { users: {} };
await db.write();

const SPIN_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

function getUser(chatId) {
  return db.data.users[chatId] ||= { balance: 0, lastSpin: 0 };
}

function canSpin(chatId) {
  const user = getUser(chatId);
  return Date.now() - user.lastSpin >= SPIN_COOLDOWN_MS;
}

function timeLeft(chatId) {
  const user = getUser(chatId);
  const elapsed = Date.now() - user.lastSpin;
  const remaining = SPIN_COOLDOWN_MS - elapsed;
  if (remaining < 0) return '0m 0s';
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${m}m ${s}s`;
}

function spinWheel() {
  // Random tokens between 100 and 1000 (average ~555)
  return Math.floor(Math.random() * 901) + 100;
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `🌌 Welcome to Celestial Spin!\n\n` +
    `Earn EARTH tokens every 4 hours by spinning the cosmic wheel.\n\n` +
    `Track your token balance, next spin time, and milestones on the live dashboard.\n\n` +
    `Use /spin to start spinning!`
  );
});

bot.onText(/\/spin/, async (msg) => {
  const chatId = msg.chat.id;
  await db.read();

  if (!canSpin(chatId)) {
    return bot.sendMessage(chatId,
      `⏳ You can spin again in ${timeLeft(chatId)}.`
    );
  }

  const tokens = spinWheel();
  const user = getUser(chatId);
  user.balance += tokens;
  user.lastSpin = Date.now();

  await db.write();

  const dashboardUrl = 'https://celestialspingood.netlify.app'; // Change to your deployed frontend URL

  bot.sendMessage(chatId,
    `🎉 You spun the cosmic wheel and earned ${tokens} EARTH tokens!\n\n` +
    `Your total balance is now ${user.balance} EARTH tokens.\n\n` +
    `Check your progress and dashboard here: ${dashboardUrl}`
  );
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  await db.read();
  const user = getUser(chatId);
  bot.sendMessage(chatId, `🌍 Your EARTH Tokens balance: ${user.balance}`);
});

console.log("✅ Bot is running and polling Telegram...");

