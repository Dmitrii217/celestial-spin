import React, { useEffect, useState } from 'react'
import TokenDisplay from './components/TokenDisplay'
import Milestones from './components/Milestones'
import { fetchBalance } from './api'

const milestones = [
  { name: 'Moon', tokens: 1, emoji: '🌕' },
  { name: 'Venus', tokens: 280, emoji: '♀️' },
  { name: 'Mercury', tokens: 520, emoji: '☿️' },
  { name: 'Mars', tokens: 520, emoji: '🔴' },
  { name: 'Sun', tokens: 1000, emoji: '☀️' },
  { name: 'Jupiter', tokens: 4200, emoji: '🪐' },
  { name: 'Saturn', tokens: 8000, emoji: '🪐' },
  { name: 'Uranus', tokens: 17200, emoji: '🌀' },
  { name: 'Neptune', tokens: 28700, emoji: '🔵' },
  { name: 'Pluto', tokens: 39500, emoji: '❄️' },
  { name: 'Haumea', tokens: 50000, emoji: '🧊' },
  { name: 'Makemake', tokens: 50000, emoji: '🧊' },
  { name: 'Eris', tokens: 67700, emoji: '🧊' },
  { name: 'Sedna', tokens: 80000, emoji: '🧊' },
  { name: '2012 VP113', tokens: 87000, emoji: '🛸' },
  { name: 'V774104', tokens: 100000, emoji: '🌌' }
]

function App() {
  const [balance, setBalance] = useState(0)

  // Get userId from URL query parameter 'tgId'
  const getUserIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tgId') || '806916617' // fallback userId
  }

  const userId = getUserIdFromUrl()

  useEffect(() => {
    async function getData() {
      try {
        const data = await fetchBalance(userId)
        setBalance(data.balance)
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }

    getData()

    const interval = setInterval(getData, 30000) // refresh every 30 seconds
    return () => clearInterval(interval)
  }, [userId])

  return (
    <div className="app">
      <h1>🌌 Celestial Spin Dashboard</h1>
      <TokenDisplay balance={balance} />
      <Milestones balance={balance} milestones={milestones} />
      <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#888' }}>
        Keep spinning to reach higher celestial milestones and unlock new cosmic rewards!
      </p>
    </div>
  )
}

export default App


