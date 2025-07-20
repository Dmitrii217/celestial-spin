import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, 'db.json');

const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Initialize DB
async function init() {
  await db.read();
  if (!db.data) {
    db.data = { users: {} };
    await db.write();
  }
}
await init();

// ✅ GET balance and cooldown
app.get('/api/balance/:userId', async (req, res) => {
  const userId = req.params.userId;
  await db.read();

  const user = db.data.users[userId] || { balance: 0, lastSpinTimestamp: 0 };

  const now = Date.now();
  const cooldownMs = 4 * 60 * 60 * 1000;
  const nextSpin = user.lastSpinTimestamp + cooldownMs;
  const cooldown = Math.max(Math.floor((nextSpin - now) / 1000), 0);

  res.json({
    userId,
    balance: user.balance,
    cooldown,
  });
});

// ✅ POST spin
app.post('/api/spin', async (req, res) => {
  try {
    const { userId, tokens } = req.body;

    if (!userId || typeof tokens !== 'number') {
      return res.status(400).json({ error: 'Invalid userId or tokens' });
    }

    await db.read();

    if (!db.data.users[userId]) {
      db.data.users[userId] = { balance: 0, lastSpinTimestamp: 0 };
    }

    const now = Date.now();
    const cooldown = 4 * 60 * 60 * 1000;

    if (now - db.data.users[userId].lastSpinTimestamp < cooldown) {
      return res.status(429).json({ error: 'Cooldown active. Spin not allowed.' });
    }

    db.data.users[userId].balance += tokens;
    db.data.users[userId].lastSpinTimestamp = now;

    await db.write();

    res.json({
      userId,
      balance: db.data.users[userId].balance,
      lastSpinTimestamp: db.data.users[userId].lastSpinTimestamp,
    });
  } catch (error) {
    console.error('Error processing spin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Health check
app.get('/', (_, res) => {
  res.send('🌍 Celestial Spin backend is running');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server started on port ${PORT}`);
});

