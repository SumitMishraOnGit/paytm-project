import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from '../components/notification';

export default function SendMoney() {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(null); // balance ke liye state add kiya
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL se `to` aur `name` parameters nikalna
  const searchParams = new URLSearchParams(location.search);
  const toUserId = searchParams.get('to');
  const toUserName = searchParams.get('name');

  // Notification dikhane ka function
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };
  
  // useEffect hook ka use karke balance fetch kiya
  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification("Authorization token not found.", "error");
        return;
      }
      try {
        const response = await axios.get("https://paytm-backend-74hf.onrender.com/api/v1//account/balance", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setBalance(response.data.balance);
      } catch (error) {
        showNotification("Failed to fetch balance.", "error");
        console.error("Balance fetch error:", error);
      }
    };
    fetchBalance();
  }, []); // Empty dependency array, taaki yeh sirf component mount hone par chale

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      showNotification("Please enter a valid amount.", "error");
      return;
    }

    if (!toUserId || toUserId === 'undefined') {
        showNotification("Invalid user to send money to.", "error");
        return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post("https://paytm-backend-74hf.onrender.com/api/v1//account/transfer", {
        to: toUserId,
        amount: Number(amount),
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      showNotification(response.data.message, "success");
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      showNotification(error.response?.data?.message || "Transfer failed.", "error");
      console.error("Transfer error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Notification 
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-md relative">
        {balance !== null && ( // agar balance loaded hai to dikhao
          <div className="absolute top-4 right-4 text-sm font-semibold text-gray-600">
            Balance: ${balance}
          </div>
        )}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
          <p className="text-gray-500 text-sm mt-1">
            Send money to **{toUserName}**
          </p>
        </div>

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-lg font-medium transition duration-200 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Send Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
