import express from 'express'
import cors from 'cors'
import { getBalanceForUser, getCooldownForUser, recordSpinForUser, init } from './services/dataService.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Initialize database (load or create default data)
await init()

// API endpoint to get balance and cooldown info for a user
app.get('/api/balance/:userId', (req, res) => {
  const userId = req.params.userId

  const balance = getBalanceForUser(userId)
  const cooldown = getCooldownForUser(userId)

  res.json({ userId, balance, cooldown })
})

// API endpoint to record a spin and update user data (optional, if you want)
app.post('/api/spin/:userId', (req, res) => {
  const userId = req.params.userId
  const reward = req.body.reward

  if (!reward || typeof reward !== 'number') {
    return res.status(400).json({ error: 'Reward must be a number' })
  }

  recordSpinForUser(userId, reward)
  const balance = getBalanceForUser(userId)
  const cooldown = getCooldownForUser(userId)

  res.json({ userId, balance, cooldown })
})

app.listen(PORT, () => {
  console.log(`Backend API server running on port ${PORT}`)
})

