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
const PORT = process.env.PORT || 3000; // ✅ fallback only if not on Render

app.use(cors());
app.use(express.json());

// Initialize DB
async function init() {
  await db.read();
  if (!db.data) {
