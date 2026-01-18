import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Input from './input';
import Notification from '../components/notification';

// Use localhost for testing
const API_BASE = "http://localhost:5000/api/v1";

// Signup form component
export default function SignupCard() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard';
    }
  }, []);

  // Function to show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First Name is required';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        const requestData = {
          username: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password
        };

        const response = await axios.post(`${API_BASE}/user/signup`, requestData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = response.data;

        if (data.token) {
          localStorage.setItem("token", data.token);
          showNotification("Signup successful!", "success");
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          showNotification(data.message || "Signup failed", "error");
        }
      } catch (error) {
        showNotification(error.response?.data?.message || "An error occurred. Please try again.", "error");
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-sm">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sign Up</h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter your information to create an account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="First Name"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
        />
        <Input
          label="Last Name"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="johndoe@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium transition duration-200 hover:bg-gray-800"
          >
            Sign Up
          </button>
        </div>
      </form>

      <div className="text-center mt-6 text-sm text-gray-500">
        Already have an account? <Link to="/signin" className="font-semibold text-blue-600 hover:underline">Signin</Link>
      </div>
    </div>
  );
}