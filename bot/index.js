import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv'
import {
  updateUserSpin,
  getBalanceForUser,
  getNextSpinTimeForUser,
  initDB,
} from './services/dataService.js'

dotenv.config()

console.log('✅ Loading BOT_TOKEN:', process.env.BOT_TOKEN ? 'YES' : 'NO')

await initDB()

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })
console.log('🤖 Bot is running and polling Telegram...')

const COOLDOWN_MS = 4 * 60 * 60 * 1000

bot.onText(/\/start/, (msg) => {
  console.log(`/start received from ${msg.from.id}`)
  bot.sendMessage(
    msg.chat.id,
    `🌌 Welcome to Celestial Spin!\nUse /spin to earn EARTH tokens every 4 hours.`
  )
})

bot.onText(/\/balance/, async (msg) => {
  const userId = String(msg.from.id)
  const balance = getBalanceForUser(userId)
  console.log(`/balance from ${userId} — balance: ${balance}`)
  bot.sendMessage(msg.chat.id, `🌍 Your balance is ${balance} EARTH.`)
})

bot.onText(/\/spin/, async (msg) => {
  const userId = String(msg.from.id)
  const now = Date.now()
  const nextSpin = getNextSpinTimeForUser(userId)

  if (now < nextSpin) {
    const waitMs = nextSpin - now
    const minutes = Math.ceil(waitMs / 60000)
    console.log(`/spin from ${userId} — on cooldown (${minutes} min left)`)
    bot.sendMessage(
      msg.chat.id,
      `⏳ You can spin again in ${minutes} minutes.`
    )
    return
  }

  const tokensEarned = Math.floor(Math.random() * 901) + 100
  await updateUserSpin(userId, tokensEarned)
  console.log(`/spin from ${userId} — earned ${tokensEarned} tokens`)
  bot.sendMessage(msg.chat.id, `🎉 You earned ${tokensEarned} EARTH tokens!`)
  bot.sendMessage(msg.chat.id, `⏳ You can spin again in 240 minutes.`)
})

