import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

function HerdReport() {
    const [elephants, setElephants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHerd = async () => {
            try {
                const response = await api.get('/dashboard');
                setElephants(response.data.elephants);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch herd for report", err);
                setLoading(false);
            }
        };
        fetchHerd();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Herd Data...</div>;

    const healthyCount = elephants.filter(e => e.status === 'Healthy').length;
    const warningCount = elephants.filter(e => e.status === 'Warning').length;
    const criticalCount = elephants.filter(e => e.status === 'Critical').length;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--glass-border)', color: 'var(--text-muted)' }}>
                <h2 style={{ color: '#fff' }}>Health Profiles & Herd Report</h2>
                <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Please select an elephant from the <Link to="/dashboard" style={{ color: 'var(--primary-accent)', textDecoration: 'none' }}>Dashboard</Link> to view their specific health predictors and log daily records.</p>
            </div>

            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>📊 Herd Health Summary</h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.print()}
                        style={{ padding: '8px 16px', background: 'var(--primary-accent)' }}
                    >
                        🖨️ Print Report
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Herd</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', marginTop: '0.5rem' }}>{elephants.length}</div>
                    </div>
                    <div style={{ background: 'rgba(0, 255, 136, 0.05)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                        <h4 style={{ margin: 0, color: '#00ff88', fontSize: '0.9rem', textTransform: 'uppercase' }}>Healthy</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00ff88', marginTop: '0.5rem' }}>{healthyCount}</div>
                    </div>
                    <div style={{ background: 'rgba(255, 170, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 170, 0, 0.2)' }}>
                        <h4 style={{ margin: 0, color: '#ffaa00', fontSize: '0.9rem', textTransform: 'uppercase' }}>Warning</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffaa00', marginTop: '0.5rem' }}>{warningCount}</div>
                    </div>
                    <div style={{ background: 'rgba(255, 0, 64, 0.05)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 0, 64, 0.2)' }}>
                        <h4 style={{ margin: 0, color: '#ff0040', fontSize: '0.9rem', textTransform: 'uppercase' }}>Critical</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff0040', marginTop: '0.5rem' }}>{criticalCount}</div>
                    </div>
                </div>

                <h4>Needs Attention</h4>
                <div style={{ marginTop: '1rem' }}>
                    {elephants.filter(e => e.status === 'Warning' || e.status === 'Critical').length === 0 ? (
                        <div style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.05)', color: '#00ff88', borderRadius: '8px', textAlign: 'center' }}>
                            All elephants are currently in healthy condition!
                        </div>
                    ) : (
                        <table className="history-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Age</th>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>AI Diagnosis</th>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {elephants.filter(e => e.status === 'Warning' || e.status === 'Critical').map(elephant => (
                                    <tr key={elephant.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{elephant.name}</td>
                                        <td style={{ padding: '12px' }}>{elephant.age} yrs</td>
                                        <td style={{ padding: '12px' }}>
                                            <span className={`status-badge status-${elephant.status}`} style={{ margin: 0 }}>
                                                {elephant.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', color: elephant.status === 'Critical' ? '#ff0040' : '#ffaa00' }}>
                                            {(elephant.diagnosis && elephant.diagnosis !== 'None' && elephant.diagnosis !== 'No_Diagnosis') ? elephant.diagnosis : 'Pending Analysis'}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <Link to={`/profile/${elephant.id}`} className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HerdReport;
