import { AppBar } from '../components/Appbar';
import { Balance } from '../components/Balance';
import { Users } from '../components/Users';

function Dashboard() {
  const balance = 5000; // Mock data
  const firstName = "User"; // Mock data
  const users = [ // Mock data
    { firstName: 'User 1', lastName: '', id: 'U1' },
    { firstName: 'User 2', lastName: '', id: 'U2' },
    { firstName: 'User 3', lastName: '', id: 'U3' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4">
        <AppBar firstName={firstName} />
        <Balance balance={balance} />
        <Users users={users} />
      </div>
    </div>
  );
}

export default Dashboard;