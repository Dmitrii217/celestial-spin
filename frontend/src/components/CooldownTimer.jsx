import React, { useState, useEffect } from 'react'

export default function CooldownTimer({ cooldown }) {
  const [secondsLeft, setSecondsLeft] = useState(cooldown * 60)

  useEffect(() => {
    setSecondsLeft(cooldown * 60)
  }, [cooldown])

  useEffect(() => {
    if (secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft(prev => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <div>
      {secondsLeft > 0
        ? `Next spin available in ${minutes}m ${seconds}s`
        : 'You can spin now!'}
    </div>
  )
}
