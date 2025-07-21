// backend/services/dataService.js
import { supabase } from './supabaseClient.js';

export async function getBalanceForUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('balance')
    .eq('userId', userId)
    .single();

  if (error || !data) return 0;
  return data.balance;
}

export async function getCooldownForUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('nextSpin')
    .eq('userId', userId)
    .single();

  if (error || !data) return 0;
  return new Date(data.nextSpin).getTime();
}

export async function recordSpinForUser(userId, tokensEarned, nextSpinTime) {
  const { data: existing, error } = await supabase
    .from('users')
    .select('*')
    .eq('userId', userId)
    .single();

  if (existing) {
    await supabase
      .from('users')
      .update({
        balance: existing.balance + tokensEarned,
        nextSpin: new Date(nextSpinTime).toISOString(),
      })
      .eq('userId', userId);
  } else {
    await supabase.from('users').insert([
      {
        userId,
        balance: tokensEarned,
        nextSpin: new Date(nextSpinTime).toISOString(),
      },
    ]);
  }
}
