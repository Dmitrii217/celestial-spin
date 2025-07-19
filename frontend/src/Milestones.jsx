import React from 'react';

export default function Milestones({ balance, milestones }) {
  return (
    <div>
      <h2>Milestones</h2>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {milestones.map(({ name, tokens, emoji }) => {
          const reached = balance >= tokens;
          return (
            <li key={name} style={{
              marginBottom: 8,
              color: reached ? '#00ff00' : '#555',
              fontWeight: reached ? 'bold' : 'normal'
            }}>
              {emoji} {name} - {tokens.toLocaleString()} tokens {reached ? '✅' : '❌'}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

