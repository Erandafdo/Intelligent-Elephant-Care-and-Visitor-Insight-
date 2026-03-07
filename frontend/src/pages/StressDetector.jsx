import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../pages/Dashboard.css';
import ProfileHeader from '../components/ProfileHeader';

function StressDetector() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    // Profile state
    const [profileData, setProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        // Fetch history API from unified Flask on Port 5005
        fetch('http://localhost:5005/api/history')
            .then(res => res.json())
            .then(data => {
                setHistory(data);
                setStatsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching stress history:", err);
                setStatsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!id) {
            setProfileLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get(`/elephants/${id}`);
                setProfileData(res.data);
                setProfileLoading(false);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    console.error("Failed to load profile", err);
                    setProfileLoading(false);
                }
            }
        };
        fetchProfile();
    }, [id, navigate]);

    return (
        <div>
            <div className="container" style={{ paddingTop: '1rem' }}>

                {profileLoading ? (
                    <div style={{ textAlign: 'center', margin: '20px 0' }}>Loading Profile...</div>
                ) : profileData ? (
                    <ProfileHeader
                        elephant={profileData.elephant}
                        latest_status={profileData.latest_status}
                        latest_diagnosis={profileData.latest_diagnosis}
                        risk_details={profileData.risk_details}
                    />
                ) : (
                    <div className="container" style={{ paddingTop: '2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--glass-border)', color: 'var(--text-muted)' }}>
                            <h2>Stress Detector Monitoring</h2>
                            <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Please select an elephant from the <a href="/dashboard" style={{ color: 'var(--primary-accent)', textDecoration: 'none' }}>Dashboard</a> to view their specific realtime stress tracking.</p>
                        </div>
                    </div>
                )}

                <h1 style={{ marginBottom: '1rem' }}>Stress Detector Monitoring</h1>

                <div className="dashboard-grid">
                    {/* Video Feed Component */}
                    <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                        <h2>Real-time Video Feed</h2>
                        <div style={{ background: '#000', borderRadius: '10px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                            <img
                                src="http://localhost:5005/api/video_feed"
                                alt="Stress Detector Video Feed"
                                style={{ width: '100%', maxWidth: '800px', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="color:white; padding: 50px;">Camera Feed Unavailable. Please ensure the unified backend is running on port 5005.</div>' }}
                            />
                        </div>
                    </div>

                    {/* Stats Component */}
                    <div className="glass-card">
                        <h2>Last 7 Days Statistics</h2>
                        {statsLoading ? (
                            <p>Loading stats...</p>
                        ) : (
                            <div style={{ marginTop: '1rem' }}>
                                {history.length === 0 ? (
                                    <p>No historical data available.</p>
                                ) : (
                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                                        {history.map((log, index) => (
                                            <li key={index} style={{ padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                                <strong>{log.date}</strong>: {log.stress_level} Stress Level (Status: {log.status})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StressDetector;
