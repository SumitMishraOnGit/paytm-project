import { Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/signup';
import Signin from './pages/signin';
import Dashboard from './pages/dashboard';
import LandingPage from './pages/LandingPage'; 

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<LandingPage />} /> 
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    </>
  )
}
    export default App;