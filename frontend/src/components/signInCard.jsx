import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Input from './input';
import Notification from '../components/notification';

function SigninCard() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  // Function to show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await axios.post("https://paytm-backend-74hf.onrender.com/api/v1/user/signin", {
          // body
          username: formData.email,
          password: formData.password,
        }, {
          headers: {
              'Content-Type': 'application/json'
            }
          });

        const data = response.data;

        if (data.token) {
          localStorage.setItem("token", data.token);
          showNotification("Signin successful!", "success");
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          showNotification(data.message || "Signin failed", "error");
        }
      }
      catch (error) {
        showNotification("An error occurred. Please try again.", "error");
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
            onClick={handleSubmit}
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
  )
}

export default SigninCard;