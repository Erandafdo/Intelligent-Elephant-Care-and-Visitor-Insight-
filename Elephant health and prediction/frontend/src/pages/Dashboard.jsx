import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function Dashboard() {
    const [elephants, setElephants] = useState([]);
    const [user, setUser] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Filters and View State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/dashboard');
                setUser(response.data.user);
                setElephants(response.data.elephants);
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError('Failed to load dashboard data.');
                    setLoading(false);
                }
            }
        };

        fetchDashboard();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;

    // Filter Logic
    const filteredElephants = elephants.filter(elephant => {
        const matchesSearch = elephant.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || elephant.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div>
            <nav className="glass-card" style={{ borderRadius: 0, padding: '1rem 2rem', borderLeft: 0, borderRight: 0, borderTop: 0 }}>
                <div className="container navbar" style={{ margin: 0, padding: 0, border: 'none' }}>
                    <div className="logo">Elephant <span>Health Detector</span></div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Welcome, {user}</span>
                        <Link to="/add" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>+ Add Elephant</Link>
                        <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', padding: '8px 16px' }}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: '2rem' }}>
                <h1 style={{ marginBottom: '1rem' }}>Pinnawala Herd Database</h1>

                <div className="dashboard-controls">
                    <div className="controls-group">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Healthy">Healthy</option>
                            <option value="Warning">Warning</option>
                            <option value="Critical">Critical</option>
                            <option value="Error">Error / Unknown</option>
                        </select>
                    </div>

                    <div className="controls-group">
                        <span style={{ color: 'var(--text-muted)' }}>Showing {filteredElephants.length} of {elephants.length} Profiles</span>

                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                Grid ⊞
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                List ▤
                            </button>
                        </div>
                    </div>
                </div>

                {filteredElephants.length === 0 ? (
                    <div className="empty-state">
                        <h2 style={{ color: 'var(--text-muted)' }}>No elephants match your filters.</h2>
                        <button onClick={() => { setSearchQuery(''); setFilterStatus('All'); }} className="btn btn-outline" style={{ marginTop: '1rem' }}>Clear Filters</button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'dashboard-grid' : 'dashboard-list'}>
                        {filteredElephants.map((elephant) => {
                            // GRID VIEW
                            if (viewMode === 'grid') {
                                return (
                                    <Link to={`/profile/${elephant.id}`} key={elephant.id} className="glass-card elephant-card" style={{ transition: 'transform 0.3s' }}>
                                        <img src={elephant.image_url} alt={elephant.name} className="elephant-img" />
                                        <h2>{elephant.name}</h2>
                                        <p style={{ color: 'var(--text-muted)' }}>{elephant.age} Years Old</p>

                                        <div className={`status-badge status-${elephant.status}`}>
                                            {elephant.status}
                                        </div>

                                        {elephant.diagnosis && elephant.diagnosis !== 'None' && (
                                            <div style={{ marginTop: '0.5rem', color: '#ff0040', fontSize: '0.8rem', fontWeight: 700 }}>
                                                ⚠️ Risk: {elephant.diagnosis}
                                            </div>
                                        )}
                                    </Link>
                                )
                            }

                            // LIST VIEW
                            return (
                                <Link to={`/profile/${elephant.id}`} key={elephant.id} className="glass-card elephant-list-item">
                                    <div className="list-item-left">
                                        <img src={elephant.image_url} alt={elephant.name} className="elephant-img" />
                                        <div className="list-item-details">
                                            <h2>{elephant.name}</h2>
                                            <p style={{ color: 'var(--text-muted)' }}>Male • {elephant.age} Years Old</p>
                                        </div>
                                    </div>

                                    <div className="list-item-right">
                                        {elephant.diagnosis && elephant.diagnosis !== 'None' && (
                                            <div style={{ color: '#ff0040', fontSize: '0.9rem', fontWeight: 700 }}>
                                                ⚠️ Risk: {elephant.diagnosis}
                                            </div>
                                        )}
                                        <div className={`status-badge status-${elephant.status}`} style={{ margin: 0, minWidth: '80px', textAlign: 'center' }}>
                                            {elephant.status}
                                        </div>
                                        <span style={{ color: 'var(--primary-accent)', fontWeight: 'bold' }}>View Profile →</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
