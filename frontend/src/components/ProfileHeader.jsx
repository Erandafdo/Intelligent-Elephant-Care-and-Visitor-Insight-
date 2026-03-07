import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function ProfileHeader({ elephant, latest_status, latest_diagnosis, risk_details, handleDelete }) {
    const location = useLocation();

    if (!elephant) return null;

    return (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div className="profile-header">
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: '50%' }}>
                    <img src={elephant.image_url} alt={elephant.name} className="profile-img-large" />
                    <div>
                        <h1 style={{ fontSize: '3rem', margin: 0 }}>{elephant.name}</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Age: {elephant.age} Years</p>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            {/* Actions moved to Dashboard */}
                        </div>
                    </div>
                </div>

                <div style={{ width: '50%', background: 'rgba(0, 0, 0, 0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    {location.pathname.includes('/stress-detector') ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem' }}>Stress Analysis</span>
                                <div className="status-badge status-Warning">Monitoring</div>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ color: '#ff4081', margin: '0 0 1rem 0', fontSize: '1.4rem' }}>👁️ Real-time Video Tracking</h3>
                                <div style={{ background: 'rgba(255, 64, 129, 0.05)', borderLeft: '3px solid #ff4081', padding: '10px 15px' }}>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Behavioral Monitoring</span>
                                    <p style={{ color: '#fff', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Continuous AI analysis of movement patterns, ear flapping, and trunk sway to detect elevated stress or agitation markers in {elephant.name}.</p>
                                </div>
                            </div>
                        </>
                    ) : location.pathname.includes('/food-chain') ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem' }}>Nutrition Profile</span>
                                <div className="status-badge" style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#88ffcc', border: '1px solid rgba(76, 175, 80, 0.5)' }}>Active Diet</div>
                            </div>
                            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ background: 'rgba(76, 175, 80, 0.05)', borderLeft: '3px solid #4caf50', padding: '10px 15px' }}>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#88ffcc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biometrics & Activity</span>
                                    <p style={{ color: '#fff', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
                                        Weight: <strong>{elephant.weight_kg ? `${elephant.weight_kg} kg` : 'Unknown'}</strong> |
                                        Activity Level: <strong>{elephant.activity_level || 'Medium'}</strong>
                                    </p>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderLeft: '3px solid #ccc', padding: '10px 15px' }}>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dietary Notes</span>
                                    <p style={{ color: '#fff', margin: '4px 0 0 0', fontSize: '0.95rem' }}>{elephant.special_notes || 'No special dietary restrictions.'} Adjust portions below.</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem' }}>Current Condition</span>
                                <div className={`status-badge status-${latest_status}`}>
                                    {latest_status}
                                </div>
                            </div>

                            {latest_diagnosis && latest_diagnosis !== 'None' && latest_diagnosis !== 'No_Diagnosis' ? (
                                <div style={{ textAlign: 'left' }}>
                                    <h3 style={{ color: '#ff0040', margin: '0 0 1rem 0', fontSize: '1.4rem' }}>⚠️ Risk Detected: {latest_diagnosis}</h3>

                                    <div style={{ background: 'rgba(255, 0, 64, 0.1)', borderLeft: '3px solid #ff0040', padding: '10px 15px', marginBottom: '10px' }}>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#ff99aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Symptom Analysis</span>
                                        <p style={{ color: '#fff', margin: '4px 0 0 0', fontSize: '0.95rem' }}>{risk_details && risk_details[latest_diagnosis]?.symptoms}</p>
                                    </div>

                                    <div style={{ background: 'rgba(0, 255, 136, 0.05)', borderLeft: '3px solid #00ff88', padding: '10px 15px' }}>
                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#88ffcc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recommended Action</span>
                                        <p style={{ color: '#fff', margin: '4px 0 0 0', fontSize: '0.95rem' }}>{risk_details && risk_details[latest_diagnosis]?.action}</p>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileHeader;
