// frontend/src/components/Users.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserItem } from './UserItem';

export function Users({ users }) {
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    user.lastName.toLowerCase().includes(filter.toLowerCase())
  );

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
        {filteredUsers.map((user) => (
          <UserItem key={user.id} user={user} onSendMoney={() => navigate(`/send?to=${user.id}&name=${user.firstName}`)} />
        ))}
      </div>
    </div>
  );
}