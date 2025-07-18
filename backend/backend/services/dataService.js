kimport { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'   // Note: import JSONFile adapter for Node.js
import path from 'path'
import { fileURLToPath } from 'url'

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to your shared db.json (adjust if needed)
const file = path.join(__dirname, '../../db.json')

// Create adapter and Low instance
const adapter = new JSONFile(file)
const db = new Low(adapter)

// Initialize database with default structure
export async function init() {
  await db.read()
  if (!db.data) {
    db.data = { users: {} }
    await db.write()
  }
}

// Get token balance for a user
export async function getBalanceForUser(userId) {
  await db.read()
  return db.data.users?.[userId]?.balance || 0
}

// Get next spin time for a user
export async function getNextSpinTimeForUser(userId) {
  await db.read()
  return db.data.users?.[userId]?.nextSpinTime || 0
}

