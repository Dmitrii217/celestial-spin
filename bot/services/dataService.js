import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const file = path.join(__dirname, '../../db.json')
const adapter = new JSONFile(file)

// ✅ FIX: Provide default data directly here
const db = new Low(adapter, { users: {} })

const COOLDOWN_MS = 4 * 60 * 60 * 1000 // 4 hours

export async function initDB() {
  await db.read()
  // ✅ Safe fallback
  if (!db.data) {
    db.data = { users: {} }
    await db.write()
  }
}

function getUser(userId) {
  return db.data.users[userId] || { balance: 0, lastSpin: 0 }
}

export function getBalanceForUser(userId) {
  const user = getUser(userId)
  return user.balance || 0
}

export function getNextSpinTimeForUser(userId) {
  const user = getUser(userId)
  return user.lastSpin + COOLDOWN_MS || 0
}

export async function updateUserSpin(userId, tokensEarned) {
  await db.read()
  if (!db.data.users[userId]) {
    db.data.users[userId] = { balance: 0, lastSpin: 0 }
  }
  db.data.users[userId].balance += tokensEarned
  db.data.users[userId].lastSpin = Date.now()
  await db.write()
}

