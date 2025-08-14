// frontend/src/components/SigninCard.jsx
import React, { useState } from 'react';
import Input from './Input';
import { Link } from 'react-router-dom'; // Import Link

function SigninCard() {
  // ... (Rest of the SigninCard code)

  return (
    <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-sm">
      {/* ... (Rest of the UI code) */}
      <div className="text-center mt-6 text-sm text-gray-500">
        Don't have an account? <Link to="/signup" className="font-semibold text-blue-600 hover:underline">Sign up</Link>
      </div>
    </div>
  );
}

export default SigninCard;