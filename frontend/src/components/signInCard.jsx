// frontend/src/components/SigninCard.jsx

import React, { useState } from 'react';
import Input from './Input';
import { Link } from 'react-router-dom';

function SigninCard() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form submitted successfully:', formData);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <Input 
          label="Email" 
          name="email" 
          type="email" 
          placeholder="johndoe@example.com"
          value={formData.email} 
          onChange={handleChange} 
          error={errors.email}
        />
        
        {/* Password Input */}
        <Input 
          label="Password" 
          name="password" 
          type="password" 
          value={formData.password} 
          onChange={handleChange} 
          error={errors.password}
        />

        {/* Signin Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium transition duration-200 hover:bg-gray-800"
          >
            Sign In
          </button>
        </div>
      </form>

      {/* Signup link */}
      <div className="text-center mt-6 text-sm text-gray-500">
        Don't have an account? <Link to="/signup" className="font-semibold text-blue-600 hover:underline">Sign up</Link>
      </div>
    </div>
  );
}

export default SigninCard;