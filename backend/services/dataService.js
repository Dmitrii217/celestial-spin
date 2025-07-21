// backend/services/dataService.js
import { supabase } from './supabaseClient.js';

export async function init() {
  // Optional: any setup logic you want here
  console.log("Supabase connected ✅");
}

export async function getBalanceForUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.balance;
}

export async function getNextSpinTimeForUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('nextSpin')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.nextSpin;
}

