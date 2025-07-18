import express from 'express';
import { init, getBalanceForUser, getNextSpinTimeForUser, addTokensForUser } from './services/dataService.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

await init(); // Initialize DB

// Your API routes here...

app.listen(process.env.PORT || 3000, () => {
  console.log('Backend server started');
});

