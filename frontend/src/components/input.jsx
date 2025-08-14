// frontend/src/components/Input.jsx
import React from 'react';

function Input({ label, name, type, placeholder, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        } rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default Input;