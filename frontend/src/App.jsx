import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Question from './pages/Question';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register/:eventId" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/question/:checkpointId" element={<Question />} />
        <Route path="/leaderboard/:eventId" element={<Leaderboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
