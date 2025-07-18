// src/api.js

// Replace localhost and port if your backend runs elsewhere
const API_BASE_URL = 'https://celestial-spin.onrender.com';

export async function fetchBalance(userId) {
  const res = await fetch(`${API_BASE_URL}/balance/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch balance');
  return res.json();  // { userId, balance, cooldown }
}
