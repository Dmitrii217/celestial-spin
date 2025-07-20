import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbFile = path.join(__dirname, '../../db.json')

const adapter = new JSONFile(dbFile)
const db = new Low(adapter)

const defaultData = {
  users: {}
}

export async function init() {
  await db.read()
  if (!db.data) {
    db.data = defaultData
    await db.write()
  }
}

export async function getBalanceForUser(userId) {
  await db.read()
  return db.data.users?.[userId]?.balance || 0
}

// Return next spin timestamp = lastSpin + 4 hours
export async function getNextSpinTimeForUser(userId) {
  await db.read()
  const lastSpin = db.data.users?.[userId]?.lastSpin || 0
  const FOUR_HOURS = 4 * 60 * 60 * 1000
  return lastSpin + FOUR_HOURS
}

export async function addTokensForUser(userId, tokensToAdd) {
  await db.read()
  if (!db.data.users[userId]) {
    db.data.users[userId] = { balance: 0, lastSpin: 0 }
  }
  db.data.users[userId].balance += tokensToAdd
  db.data.users[userId].lastSpin = Date.now()
  await db.write()
}

