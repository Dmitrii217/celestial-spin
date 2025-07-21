import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './services/supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ensure user exists
async function ensureUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ user_id: userId, balance: 0, last_spin: 0 }]);

    if (insertError) throw insertError;
  }
}

// GET balance and cooldown
app.get('/api/balance/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    await ensureUser(userId);

    const { data, error } = await supabase
      .from('users')
      .select('balance, last_spin')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    const now = Date.now();
    const cooldownMs = 4 * 60 * 60 * 1000;
    const nextSpin = data.last_spin + cooldownMs;
    const cooldown = Math.max(Math.floor((nextSpin - now) / 1000), 0);

    res.json({
      userId,
      balance: data.balance,
      cooldown,
    });
  } catch (err) {
    console.error('Error in /balance:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// POST spin
app.post('/api/spin', async (req, res) => {
  const { userId, tokens } = req.body;

  if (!userId || typeof tokens !== 'number') {
    return res.status(400).json({ error: 'Invalid userId or tokens' });
  }

  try {
    await ensureUser(userId);

    const { data: user, error } = await supabase
      .from('users')
      .select('balance, last_spin')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    const now = Date.now();
    const cooldownMs = 4 * 60 * 60 * 1000;

    if (now - user.last_spin < cooldownMs) {
      return res.status(429).json({ error: 'Cooldown active. Spin not allowed.' });
    }

    const newBalance = user.balance + tokens;

    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance, last_spin: now })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    res.json({
      userId,
      balance: newBalance,
      lastSpinTimestamp: now,
    });
  } catch (err) {
    console.error('Error in /spin:', err);
    res.status(500).json({ error: 'Spin failed on backend' });
  }
});

// Health check
app.get('/', (_, res) => {
  res.send('🌍 Celestial Spin backend (Supabase) is running');
});

app.listen(PORT, () => {
  console.log(`✅ Backend server started on port ${PORT}`);
});

