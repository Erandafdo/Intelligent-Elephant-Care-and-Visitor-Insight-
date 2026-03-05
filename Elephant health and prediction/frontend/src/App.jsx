import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AddElephant from './pages/AddElephant';
import EditElephant from './pages/EditElephant';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add" element={<AddElephant />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/edit/:id" element={<EditElephant />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
