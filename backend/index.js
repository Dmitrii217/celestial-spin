import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { init, getBalanceForUser, getNextSpinTimeForUser, addTokensForUser } from './services/dataService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Initialize database with defaults if missing
await init()

// API endpoint to get balance and cooldown for user
app.get('/api/balance/:userId', async (req, res) => {
  const userId = req.params.userId
  const balance = await getBalanceForUser(userId)
  const nextSpin = await getNextSpinTimeForUser(userId)
  const cooldown = Math.max(Math.floor((nextSpin - Date.now()) / 1000), 0)

  res.json({ userId, balance, cooldown })
})

// Health check
app.get('/', (req, res) => {
  res.send('🌍 Celestial Spin backend is running')
})

app.listen(PORT, () => {
  console.log(`✅ Backend server started on port ${PORT}`)
})

