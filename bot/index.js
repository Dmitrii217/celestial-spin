import TelegramBot from 'node-telegram-bot-api';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env if needed
import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Error: BOT_TOKEN is not defined in environment variables.');
  process.exit(1);
}

// Setup lowdb to use JSON file in bot folder
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();
db.data ||= { users: {} };

// Helper functions
function getUser(userId) {
  if (!db.data.users[userId]) {
    db.data.users[userId] = {
      balance: 0,
      lastSpin: 0
    };
  }
  return db.data.users[userId];
}

function saveDB() {
  return db.write();
}

// Spin cooldown and token earning constants
const SPIN_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

function canSpin(user) {
  const now = Date.now();
  return now - user.lastSpin >= SPIN_COOLDOWN_MS;
}

function timeLeft(user) {
  const now = Date.now();
  const diff = SPIN_COOLDOWN_MS - (now - user.lastSpin);
  return diff > 0 ? diff : 0;
}

function msToTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  let minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function earnTokens() {
  // Random between 100 and 1000 tokens
  return Math.floor(Math.random() * 901) + 100;
}

// Initialize Telegram bot with polling
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('✅ Bot is running and polling Telegram...');

// Command handlers

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await db.read();
  getUser(chatId); // initialize user if not exists
  await saveDB();

  bot.sendMessage(chatId, 
    `🌌 Welcome to Celestial Spin!\n\n` +
    `Earn EARTH tokens every 4 hours by spinning the cosmic wheel.\n\n` +
    `Track your token balance, next spin time, and milestones on the live dashboard.\n\n` +
    `Use /spin to start spinning!`
  );
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  await db.read();
  const user = getUser(chatId);
  bot.sendMessage(chatId, `🌍 Your EARTH token balance is: ${user.balance} tokens.`);
});

bot.onText(/\/spin/, async (msg) => {
  const chatId = msg.chat.id;
  await db.read();
  const user = getUser(chatId);

  if (!canSpin(user)) {
    const left = timeLeft(user);
    bot.sendMessage(chatId, `⏳ You are on cooldown!\nNext spin available in ${msToTime(left)}.`);
    return;
  }

  // User can spin
  const earned = earnTokens();
  user.balance += earned;
  user.lastSpin = Date.now();

  await saveDB();

  bot.sendMessage(chatId, `🎉 You spun the cosmic whe

