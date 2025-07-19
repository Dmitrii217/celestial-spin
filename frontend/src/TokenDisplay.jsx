import React from 'react';

export default function TokenDisplay({ balance }) {
  return (
    <div style={{
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#00ff00',
      textShadow: '0 0 10px #00ff00'
    }}>
      🌍 Your EARTH Tokens: {balance.toLocaleString()}
    </div>
  );
}

