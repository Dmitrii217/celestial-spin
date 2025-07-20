const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://celestial-spin.onrender.com';

export async function fetchBalance(userId) {
  const res = await fetch(`${API_BASE}/api/balance/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch balance');
  return await res.json();
}
