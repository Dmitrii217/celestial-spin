import { useEffect, useState } from 'react'
import { fetchBalance } from './api.js'
import TokenDisplay from './components/TokenDisplay.jsx'
import CooldownTimer from './components/CooldownTimer.jsx'
import Milestones from './components/Milestones.jsx'

// Replace with your actual Telegram user ID
const USER_ID = '806916617'

export default function App() {
  const [balance, setBalance] = useState(0)
  const [nextSpinTime, setNextSpinTime] = useState(Date.now())

  async function loadBalance() {
    try {
      const data = await fetchBalance(USER_ID)
      setBalance(data.balance)
      setNextSpinTime(data.nextSpinTime)
    } catch (e) {
      console.error('Failed to load balance:', e)
    }
  }

  useEffect(() => {
    loadBalance()
    const interval = setInterval(loadBalance, 10000) // refresh every 10 sec
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ color: 'white', background: '#000011', minHeight: '100vh', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>🌌 Celestial Spin Dashboard</h1>
      <TokenDisplay balance={balance} />
      <CooldownTimer nextSpinTime={nextSpinTime} />
      <Milestones balance={balance} />
    </div>
  )
}

