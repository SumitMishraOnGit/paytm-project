import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/signUp';
import Signin from './pages/signIn';
import Dashboard from './pages/dashboard';

function App() {
  return (
    <>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/send" element={<SendMoney />} /> */}
        </Routes>
    </>
  )
}
    export default App;