export default function Milestones({ balance, milestones }) {
  return (
    <div>
      <h2>Milestones</h2>
      <ul>
        {milestones.map(m => {
          const reached = balance >= m.tokens
          return (
            <li key={m.name}>
              {m.emoji} {m.name} — {m.tokens} tokens — {reached ? 'Reached' : 'Not reached'}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

