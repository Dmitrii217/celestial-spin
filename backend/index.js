// backend/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { init, getBalanceForUser, getNextSpinTimeForUser, recordSpinForUser } from './services/dataService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Initialize database (Supabase or lowdb)
await init()

// GET user balance & cooldown in minutes
app.get('/api/balance/:userId', async (req, res) => {
  const userId = req.params.userId
  const balance = await getBalanceForUser(userId)
  const nextSpin = await getNextSpinTimeForUser(userId)

  let cooldownMinutes = 0
  if (nextSpin && nextSpin > Date.now()) {
    cooldownMinutes = Math.ceil((nextSpin - Date.now()) / 60000) // milliseconds to minutes rounded up
  }

  res.json({ userId, balance, cooldown: cooldownMinutes })
})

// POST spin endpoint
app.post('/api/spin', async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'Missing userId in request body' })

    const spinResult = await recordSpinForUser(userId)
    res.json(spinResult)
  } catch (error) {
    console.error('Spin failed:', error)
    res.status(500).json({ error: 'Spin failed on backend' })
  }
})

// Health check
app.get('/', (req, res) => {
  res.send('🌍 Celestial Spin backend is running')
})

app.listen(PORT, () => {
  console.log(`✅ Backend server started on port ${PORT}`)
})
