import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AddElephant from './pages/AddElephant';
import EditElephant from './pages/EditElephant';
import StressDetector from './pages/StressDetector';
import FoodChain from './pages/FoodChain';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add" element={<AddElephant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/edit/:id" element={<EditElephant />} />
          <Route path="/stress-detector" element={<StressDetector />} />
          <Route path="/stress-detector/:id" element={<StressDetector />} />
          <Route path="/food-chain" element={<FoodChain />} />
          <Route path="/food-chain/:id" element={<FoodChain />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
