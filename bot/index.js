import TelegramBot from 'node-telegram-bot-api';
import http from 'http';

// Read bot token from env variables
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Error: BOT_TOKEN environment variable is missing!');
  process.exit(1);
}

// Create Telegram bot in polling mode
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('Starting Celestial Spin Bot...');

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    `🌌 Welcome to Celestial Spin!\n\n` +
    `Earn EARTH tokens every 4 hours by spinning the cosmic wheel.\n\n` +
    `Track your token balance, next spin time, and milestones on the live dashboard.\n\n` +
    `Use /spin to start spinning!`
  );
});

// Example: Handle /spin command (replace with your real logic)
bot.onText(/\/spin/, (msg) => {
  const chatId = msg.chat.id;
  // TODO: Add your spin logic and cooldown checks here
  bot.sendMessage(chatId, 'Spinning the cosmic wheel... (logic to be implemented)');
});

// Start minimal HTTP server so Render knows app is alive
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Celestial Spin Bot is running\n');
}).listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

