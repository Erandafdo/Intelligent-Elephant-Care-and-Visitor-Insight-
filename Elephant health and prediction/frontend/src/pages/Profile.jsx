import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        temperature: '',
        heart_rate: '',
        respiratory_rate: '',
        weight_change: '',
        food_intake: '',
        stool_consistency: 'Normal',
        activity_level: 'High',
        edema: 'None',
        trunk_moisture: 'Moist',
        mucous_membrane: 'Pink',
        gait_score: 'Normal'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/elephants/${id}`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    console.error("Failed to load profile", err);
                }
            }
        };
        fetchProfile();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleHealthSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/elephants/${id}/health`, formData);
            window.location.reload(); // Quick refresh to show new data
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this elephant profile? This action cannot be undone.')) {
            try {
                await api.delete(`/elephants/${id}`);
                navigate('/dashboard');
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Profile...</div>;
    if (!data) return <div>Failed to load data</div>;

    const { elephant, logs, latest_status, latest_diagnosis, risk_details } = data;

    return (
        <div>
            <nav className="glass-card" style={{ borderRadius: 0, padding: '1rem 2rem', borderLeft: 0, borderRight: 0, borderTop: 0 }}>
                <div className="container navbar" style={{ margin: 0, padding: 0, border: 'none' }}>
                    <div className="logo">Elephant <span>Health Detector</span></div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/dashboard" style={{ color: '#fff', fontWeight: 600 }}>← Back to Dashboard</Link>

                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' }}></div>

                        <Link to={`/edit/${elephant.id}`} className="btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: '#fff', padding: '6px 12px', fontSize: '0.8rem' }}>
                            Edit Profile
                        </Link>

                        <button onClick={handleDelete} className="btn" style={{ background: 'rgba(255, 0, 64, 0.2)', border: '1px solid #ff0040', color: '#ff0040', padding: '6px 12px', fontSize: '0.8rem' }}>
                            Delete
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container">
                <div className="glass-card">
                    <div className="profile-header">
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: '50%' }}>
                            <img src={elephant.image_url} alt={elephant.name} className="profile-img-large" />
                            <div>
                                <h1 style={{ fontSize: '3rem', margin: 0 }}>{elephant.name}</h1>
                                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Age: {elephant.age} Years</p>
                            </div>
                        </div>

                        <div style={{ width: '50%', background: 'rgba(0, 0, 0, 0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem' }}>Current Condition</span>
                                <div className={`status-badge status-${latest_status}`}>
                                    {latest_status}
                                </div>
                            </div>

                            {latest_diagnosis && latest_diagnosis !== 'None' ? (
                                <div style={{ textAlign: 'left' }}>
                                    <h3 style={{ color: '#ff0040', margin: '0 0 1rem 0', fontSize: '1.4rem' }}>⚠️ Risk Detected: {latest_diagnosis}</h3>

                                    <div style={{ background: 'rgba(255, 0, 64, 0.1)', borderLeft: '3px solid #ff0040', padding: '10px 15px', marginBottom: '10px' }}>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#ff99aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Symptom Analysis</span>
                                        <p style={{ color: '#fff', margin: '4px 0 0 0', fontSize: '0.95rem' }}>{risk_details[latest_diagnosis]?.symptoms}</p>
                                    </div>

                                    <div style={{ background: 'rgba(0, 255, 136, 0.05)', borderLeft: '3px solid #00ff88', padding: '10px 15px' }}>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#88ffcc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recommended Action</span>
                                        <p style={{ color: '#fff', margin: '4px 0 0 0', fontSize: '0.95rem' }}>{risk_details[latest_diagnosis]?.action}</p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'left' }}>
                                    <h3 style={{ color: '#00ff88', margin: '0 0 1rem 0', fontSize: '1.4rem' }}>✔️ Stable Condition</h3>
                                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderLeft: '3px solid #00ff88', padding: '10px 15px' }}>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Health Assessment</span>
                                        <p style={{ color: '#fff', margin: '4px 0 0 0', fontSize: '0.95rem' }}>All physiological parameters are within normal ranges. Continue routine monitoring and diet plan.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <div>
                            <h3>Update Daily Health Record</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter today's physiological measurements for AI analysis.</p>

                            <form onSubmit={handleHealthSubmit} className="health-form">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Temperature (°C)</label>
                                        <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="36.5" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Heart Rate (BPM)</label>
                                        <input type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} placeholder="30" required />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Resp. Rate (BPM)</label>
                                        <input type="number" name="respiratory_rate" value={formData.respiratory_rate} onChange={handleChange} placeholder="8" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Weight Change (%)</label>
                                        <input type="number" step="0.1" name="weight_change" value={formData.weight_change} onChange={handleChange} placeholder="0.0" required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Food Intake (% of Normal)</label>
                                    <input type="number" name="food_intake" value={formData.food_intake} onChange={handleChange} placeholder="100" required />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Stool Consistency</label>
                                        <select name="stool_consistency" value={formData.stool_consistency} onChange={handleChange}>
                                            <option value="Normal">Normal</option>
                                            <option value="Loose">Loose (Diarrhea)</option>
                                            <option value="Constipated">Constipated</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Activity Level</label>
                                        <select name="activity_level" value={formData.activity_level} onChange={handleChange}>
                                            <option value="High">High</option>
                                            <option value="Moderate">Moderate</option>
                                            <option value="Low">Low (Lethargic)</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Edema</label>
                                        <select name="edema" value={formData.edema} onChange={handleChange}>
                                            <option value="None">None</option>
                                            <option value="Mild">Mild</option>
                                            <option value="Severe">Severe</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Trunk Moisture</label>
                                        <select name="trunk_moisture" value={formData.trunk_moisture} onChange={handleChange}>
                                            <option value="Moist">Moist (Healthy)</option>
                                            <option value="Dry">Dry (Dehydrated)</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Mucous Membrane</label>
                                        <select name="mucous_membrane" value={formData.mucous_membrane} onChange={handleChange}>
                                            <option value="Pink">Pink (Healthy)</option>
                                            <option value="Pale">Pale (Anemia/Shock)</option>
                                            <option value="Dry/Tacky">Dry/Tacky (Dehydrated)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Gait / Movement</label>
                                        <select name="gait_score" value={formData.gait_score} onChange={handleChange}>
                                            <option value="Normal">Normal</option>
                                            <option value="Stiff">Stiff (Arthritis?)</option>
                                            <option value="Lameness">Lameness</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Analyze & Save Record</button>
                            </form>
                        </div>

                        <div>
                            <h3>Recent Health History</h3>
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {logs && logs.length > 0 ? (
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Temp</th>
                                                <th>AI Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <tr key={log.id}>
                                                    <td>{log.timestamp.substring(0, 10)}</td>
                                                    <td>{log.temperature}°C</td>
                                                    <td>
                                                        <span className={`status-badge status-${log.predicted_status}`} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                                                            {log.predicted_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '8px', marginTop: '1rem' }}>
                                        No health records found yet.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
