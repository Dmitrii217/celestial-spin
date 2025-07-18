// Replace localhost and port if your backend runs elsewhere
const API_BASE = 'http://localhost:4000/api'

export async function fetchBalance(userId) {
  const res = await fetch(`${API_BASE}/balance/${userId}`)
  if (!res.ok) throw new Error('Failed to fetch balance')
  return res.json()  // { userId, balance, cooldown }
}

