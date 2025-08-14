// frontend/src/components/Balance.jsx
import React from 'react';

export function Balance({ balance }) {
  return (
    <div className="mt-8 p-4">
      <h2 className="text-xl font-bold">Your Balance</h2>
      <p className="text-2xl font-semibold mt-1">${balance}</p>
    </div>
  );
}