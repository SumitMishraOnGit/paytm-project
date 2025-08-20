import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../components/Appbar';
import { Balance } from '../components/Balance';
import { Users } from '../components/Users';
import axios from 'axios';

function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [users, setUsers] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Auth token ko localStorage se uthao
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setError('Authorization token not found.');
        navigate('/signin');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Balance fetch karne ka API call
        const balanceResponse = await axios.get("https://paytm-backend-74hf.onrender.com/api/v1/account/balance", config);
        setBalance(balanceResponse.data.balance);

        const userResponse = await axios.get("https://paytm-backend-74hf.onrender.com/api/v1/user/getUser", config);
        setFirstName(userResponse.data.firstName);

        const usersResponse = await axios.get("https://paytm-backend-74hf.onrender.com/api/v1/user/bulk?filter=", config);
        setUsers(usersResponse.data.user);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        setLoading(false);
        console.error("API call error:", err);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto">
          {/* Skeleton for AppBar */}
          <div className="flex justify-between items-center p-2 shadow-md bg-white/90 blur-sm animate-pulse">
            <div className="text-xl font-bold w-40 h-8 bg-gray-300 rounded-md"></div>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-300"></div>
            </div>
          </div>
          {/* Skeleton for Balance */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm animate-pulse">
            <div className="h-6 w-3/4 bg-gray-300 rounded-md"></div>
            <div className="mt-2 h-8 w-1/2 bg-gray-300 rounded-md"></div>
          </div>
          {/* Skeleton for Users search and list */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
            <div className="h-6 w-1/2 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="mt-4 h-10 w-full bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="mt-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-200 rounded-lg shadow-sm animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                    <div className="h-6 w-32 bg-gray-300 rounded-md"></div>
                  </div>
                  <div className="h-10 w-24 bg-gray-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state handling
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium text-red-600">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="container mx-auto">
        <AppBar firstName={firstName} />
        <Balance balance={balance} />
        <Users users={users} />
      </div>
    </div>
  );
}

export default Dashboard;
