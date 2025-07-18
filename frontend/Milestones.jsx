const milestones = [
  { name: 'Moon', distanceAU: 0.00000257, tokensRequired: 0 },
  { name: 'Venus', distanceAU: 0.28, tokensRequired: 280 },
  { name: 'Mercury', distanceAU: 0.52, tokensRequired: 520 },
  { name: 'Mars', distanceAU: 0.52, tokensRequired: 520 },
  { name: 'Sun', distanceAU: 1.0, tokensRequired: 1000 },
  { name: 'Jupiter', distanceAU: 4.2, tokensRequired: 4200 },
  { name: 'Saturn', distanceAU: 8.0, tokensRequired: 8000 },
  { name: 'Uranus', distanceAU: 17.2, tokensRequired: 17200 },
  { name: 'Neptune', distanceAU: 28.7, tokensRequired: 28700 },
  { name: 'Pluto', distanceAU: 39.5, tokensRequired: 39500 },
  { name: 'Haumea', distanceAU: 50.0, tokensRequired: 50000 },
  { name: 'Makemake', distanceAU: 50.0, tokensRequired: 50000 },
  { name: 'Eris', distanceAU: 67.7, tokensRequired: 67700 },
  { name: 'Sedna', distanceAU: 80.0, tokensRequired: 80000 },
  { name: '2012 VP113', distanceAU: 87.0, tokensRequired: 87000 },
  { name: 'V774104', distanceAU: 100.0, tokensRequired: 100000 }
]

export default function Milestones({ balance }) {
  return (
    <div>
      <h2>Milestones</h2>
      <ul>
        {milestones.map(m => {
          const reached = balance >= m.tokensRequired
          return (
            <li key={m.name} style={{ color: reached ? 'green' : 'gray' }}>
              <strong>{m.name}</strong> — {m.distanceAU} AU — {m.tokensRequired.toLocaleString()} tokens {reached ? '(Reached)' : '(Not reached)'}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

