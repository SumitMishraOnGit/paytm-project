import { Routes, Route, } from 'react-router-dom';
import Signup from './pages/signup';
import Signin from './pages/signin';
import Dashboard from './pages/dashboard';
import LandingPage from './pages/landingpage'; 
import SendMoney from './pages/SendMoney';

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<LandingPage />} /> 
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<SendMoney />} />
        </Routes>
    </>
  )
}
    export default App;