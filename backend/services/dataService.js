// backend/services/dataService.js
import { supabase } from './supabaseClient.js'

export async function init() {
  // You can do any initialization here if needed
  // For Supabase, typically nothing is needed
  console.log('✅ Supabase init complete')
}

export async function getBalanceForUser(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('userId', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      throw error
    }

    // If user doesn't exist, balance = 0
    return data ? data.balance : 0
  } catch (err) {
    console.error('getBalanceForUser error:', err)
    throw err
  }
}

export async function getNextSpinTimeForUser(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('lastSpin')
      .eq('userId', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data || !data.lastSpin) {
      // If no spin time, user can spin immediately
      return 0
    }

    // lastSpin is timestamp string from Supabase, convert to ms
    const lastSpinMs = new Date(data.lastSpin).getTime()
    // 4 hours cooldown in ms
    const cooldownMs = 4 * 60 * 60 * 1000
    return lastSpinMs + cooldownMs
  } catch (err) {
    console.error('getNextSpinTimeForUser error:', err)
    throw err
  }
}

export async function recordSpinForUser(userId) {
  try {
    // First, get current lastSpin and balance
    const { data: user, error } = await supabase
      .from('users')
      .select('lastSpin, balance')
      .eq('userId', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const now = Date.now()
    const fourHoursMs = 4 * 60 * 60 * 1000
    const lastSpinMs = user && user.lastSpin ? new Date(user.lastSpin).getTime() : 0

    // Check cooldown
    if (lastSpinMs && now - lastSpinMs < fourHoursMs) {
      const waitSeconds = Math.floor((fourHoursMs - (now - lastSpinMs)) / 1000)
      return {
        error: `Cooldown active. Please wait ${waitSeconds} seconds before next spin.`,
      }
    }

    // Calculate tokens earned (random 100-1000, average ~555)
    const tokensEarned = Math.floor(Math.random() * 901) + 100

    if (!user) {
      // Insert new user row
      const { error: insertError } = await supabase.from('users').insert({
        userId,
        balance: tokensEarned,
        lastSpin: new Date().toISOString(),
      })
      if (insertError) throw insertError

      return {
        message: 'Spin successful! First spin recorded.',
        tokensEarned,
        balance: tokensEarned,
      }
    } else {
      // Update existing user
      const newBalance = user.balance + tokensEarned
      const { error: updateError } = await supabase
        .from('users')
        .update({
          balance: newBalance,
          lastSpin: new Date().toISOString(),
        })
        .eq('userId', userId)

      if (updateError) throw updateError

      return {
        message: 'Spin successful!',
        tokensEarned,
        balance: newBalance,
      }
    }
  } catch (err) {
    console.error('recordSpinForUser error:', err)
    throw new Error('Spin update failed')
  }
}
