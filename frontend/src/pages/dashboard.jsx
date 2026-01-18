import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../components/Appbar';
import { Balance } from '../components/Balance';
import { Users } from '../components/Users';
import axios from 'axios';

// Use localhost for testing
const API_BASE = "http://localhost:5000/api/v1";

function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/account/transactions?limit=5`, config);
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error("Transaction fetch error:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Authorization token not found.');
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, usersResponse, balanceResponse, txResponse] = await Promise.all([
          axios.get(`${API_BASE}/user/getUser`, config),
          axios.get(`${API_BASE}/user/bulk?filter=`, config),
          axios.get(`${API_BASE}/account/balance`, config),
          axios.get(`${API_BASE}/account/transactions?limit=5`, config)
        ]);

        setFirstName(userResponse.data.firstName);
        setUsers(usersResponse.data.user);
        setBalance(balanceResponse.data.balance);
        setTransactions(txResponse.data.transactions);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Is the backend running on localhost:5000?");
        setLoading(false);
        console.error("API call error:", err);
      }
    };

    const fetchBalancePeriodically = async () => {
      try {
        const [balanceResponse, txResponse] = await Promise.all([
          axios.get(`${API_BASE}/account/balance`, config),
          axios.get(`${API_BASE}/account/transactions?limit=5`, config)
        ]);
        setBalance(balanceResponse.data.balance);
        setTransactions(txResponse.data.transactions);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchBalancePeriodically, 5000);
    return () => clearInterval(intervalId);

  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
        <AppBar firstName={firstName} transactions={transactions} />
        <Balance balance={balance} />
        <Users users={users} />
      </div>
    </div>
  );
}

export default Dashboard;