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

export async function getNextSpinTimeForUser(userId) {
  await db.read()
  const lastSpin = db.data.users?.[userId]?.lastSpinTimestamp || 0
  return lastSpin + 4 * 60 * 60 * 1000 // 4 hours after last spin
}

export async function addTokensForUser(userId, tokensToAdd) {
  await db.read()
  if (!db.data.users[userId]) {
    db.data.users[userId] = { balance: 0, lastSpinTimestamp: 0 }
  }
  db.data.users[userId].balance += tokensToAdd
  db.data.users[userId].lastSpinTimestamp = Date.now()
  await db.write()
}

