import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { fileURLToPath } from 'url'

// Setup LowDB database path relative to this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbFile = path.join(__dirname, '../../db.json')

const adapter = new JSONFile(dbFile)
const db = new Low(adapter)

// Default data structure
const defaultData = {
  users: {
    // userId: { balance: 0, lastSpinTimestamp: 0 }
  }
}

export async function init() {
  await db.read()
  if (!db.data) {
    db.data = defaultData
    await db.write()
  }
}

// Get user's token balance (default 0)
export function getBalanceForUser(userId) {
  const user = db.data.users[userId]
  return user?.balance || 0
}

// Get cooldown time remaining in seconds (if last spin was less than 4h ago)
export function getCooldownForUser(userId) {
  const user = db.data.users[userId]
  if (!user || !user.lastSpinTimestamp) return 0

  const FOUR_HOURS = 4 * 60 * 60 * 1000
  const elapsed = Date.now() - user.lastSpinTimestamp
  const cooldownMs = FOUR_HOURS - elapsed
  return cooldownMs > 0 ? Math.floor(cooldownMs / 1000) : 0
}

// Record a spin: add tokens and update last spin timestamp
export async function recordSpinForUser(userId, rewardTokens) {
  await db.read()
  if (!db.data.users[userId]) {
    db.data.users[userId] = { balance: 0, lastSpinTimestamp: 0 }
  }
  db.data.users[userId].balance += rewardTokens
  db.data.users[userId].lastSpinTimestamp = Date.now()
  await db.write()
}

