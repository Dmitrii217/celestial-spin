// bot/index.js (only relevant snippets shown)
// Make sure your bot fetches cooldown in minutes from backend

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

// Example inside your /balance handler
bot.onText(/\/balance/, async (msg) => {
  const userId = msg.from.id.toString()
  try {
    const res = await fetch(`http://localhost:10000/api/balance/${userId}`)
    const data = await res.json()
    if (data.cooldown > 0) {
      bot.sendMessage(userId, `🌍 Your EARTH token balance: ${data.balance}\n⏳ Next spin available in ${data.cooldown} minute(s).`)
    } else {
      bot.sendMessage(userId, `🌍 Your EARTH token balance: ${data.balance}\n✅ You can spin now! Use /spin`)
    }
  } catch {
    bot.sendMessage(userId, `❌ Failed to get balance info.`)
  }
})

// Example inside your /spin handler
bot.onText(/\/spin/, async (msg) => {
  const userId = msg.from.id.toString()
  try {
    const spinRes = await fetch(`http://localhost:10000/api/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const spinData = await spinRes.json()
    if (spinData.error) {
      if (spinData.cooldown) {
        bot.sendMessage(userId, `⏳ Please wait ${spinData.cooldown} minute(s) before your next spin.`)
      } else {
        bot.sendMessage(userId, `❌ Spin failed. Please try again later.`)
      }
    } else {
      bot.sendMessage(userId, `🎉 You earned ${spinData.tokens} EARTH tokens! Your balance is now ${spinData.balance}.`)
    }
  } catch (err) {
    bot.sendMessage(userId, `❌ Spin failed. Please try again later.`)
  }
})
