import TelegramBot from 'node-telegram-bot-api';
import express from 'express';

// Your Telegram bot token must be set in environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Error: BOT_TOKEN environment variable is not set.');
  process.exit(1);
}

// Create Telegram bot instance with polling
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Example: /start command handler
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 
    `🌌 Welcome to Celestial Spin!\nUse /spin to earn EARTH tokens every 4 hours.`
  );
});

// Example: /spin command handler (simplified)
bot.onText(/\/spin/, (msg) => {
  // You can implement your cooldown and token logic here
  bot.sendMessage(msg.chat.id, `You spun the wheel! (This is a placeholder response)`);
});

// Set up Express web server
const app = express();

app.get('/', (req, res) => {
  res.send('Celestial Spin Bot backend is running.');
});

// Use the PORT environment variable Render provides or fallback to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server listening on port ${PORT}`);
  console.log('Telegram bot polling started.');
});

