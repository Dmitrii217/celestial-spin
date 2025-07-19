// src/api.js

const API_BASE = 'https://celestial-spin.onrender.com/api';

export async function fetchBalance(userId) {
  const res = await fetch(`${API_BASE}/balance/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch balance');
  return res.json();  // { userId, balance, cooldown }
}
