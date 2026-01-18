// frontend/src/components/Users.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserItem } from './UserItem';
import axios from 'axios';
import { useEffect } from 'react';

// Use localhost for testing
const API_BASE = "http://localhost:5000/api/v1";

export function Users() {
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API_BASE}/user/bulk?filter=${filter}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data.user);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [filter]);

  return (
    <div className="mt-8 p-4">
      <h2 className="text-xl font-bold">Users</h2>
      <input
        type="text"
        placeholder="Search users..."
        className="w-full mt-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="mt-6 space-y-4">
        {users.map((user) => (
          <UserItem key={user._id} user={user} onSendMoney={() => navigate(`/send?to=${user._id}&name=${user.firstName}`)} />
        ))}
      </div>
    </div>
  );
}
