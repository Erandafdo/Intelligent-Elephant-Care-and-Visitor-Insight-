import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await api.post('/auth/login', { username, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-card" style={{ width: '400px', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#00f2ea" strokeWidth="2" />
                        <path d="M15 9C15 9 14 11 12 11C10 11 9 9 9 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h1>Pinnawala Connect</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Elephant Health AI Monitor</p>

                {error && (
                    <div style={{ background: 'rgba(255, 0, 64, 0.2)', color: '#ff0040', padding: '10px', borderRadius: '8px', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%' }}>Access System</button>
                </form>

                <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Authorized Personnel Only (Vets/Feeders)
                </p>
            </div>
        </div>
    );
}

export default Login;
