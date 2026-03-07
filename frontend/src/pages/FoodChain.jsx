import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProfileHeader from '../components/ProfileHeader';

// ─── Shared stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, color = '#fff', bg = 'rgba(255,255,255,0.04)' }) {
    return (
        <div style={{ background: bg, padding: '1.5rem', borderRadius: '10px', textAlign: 'center', border: `1px solid ${color}33` }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        </div>
    );
}

// ─── Overview tab (when no elephant selected) ────────────────────────────────
function FoodChainOverview() {
    const [overview, setOverview] = useState(null);
    const [report, setReport] = useState(null);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        api.get('/food/overview').then(r => setOverview(r.data)).catch(console.error);
    }, []);

    const generateReport = async () => {
        setReportLoading(true);
        try {
            const r = await api.get(`/food/report/${reportDate}`);
            setReport(r.data);
        } catch (err) {
            setReport([]);
        }
        setReportLoading(false);
    };

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            {/* Summary cards */}
            {overview && (
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>📊 Sanctuary Food Chain Overview</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                        <StatCard label="Total Logs" value={overview.total_logs} color="#818cf8" />
                        <StatCard label="Elephants" value={overview.ele_count} color="#00ff88" bg="rgba(0,255,136,0.05)" />
                        <StatCard label="Avg Health" value={`${overview.avg_health}%`} color="#00ff88" bg="rgba(0,255,136,0.05)" />
                        <StatCard label="Today's Food" value={`${overview.food_today} kg`} color="#ffaa00" bg="rgba(255,170,0,0.05)" />
                        <StatCard label="Days Logged" value={overview.unique_days} color="#818cf8" />
                    </div>
                </div>
            )}

            {/* Daily Report generator */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>📅 Daily Feeding Report</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Generate a complete feeding record for any given date.</p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label>Select Date</label>
                        <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={generateReport} disabled={reportLoading} style={{ height: '42px' }}>
                        {reportLoading ? 'Loading…' : '🚀 Generate Report'}
                    </button>
                </div>

                {report !== null && (
                    report.length === 0 ? (
                        <div style={{ padding: '1rem', background: 'rgba(255,170,0,0.08)', borderRadius: '8px', color: '#ffaa00' }}>
                            No feeding data for {reportDate}.
                        </div>
                    ) : (
                        <>
                            {/* Summary strip */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <StatCard label="Total Morning" value={`${report.reduce((s, r) => s + (r['Morning Food (kg)'] || 0), 0).toFixed(1)} kg`} color="#ffaa00" bg="rgba(255,170,0,0.05)" />
                                <StatCard label="Total Evening" value={`${report.reduce((s, r) => s + (r['Evening Food (kg)'] || 0), 0).toFixed(1)} kg`} color="#818cf8" />
                                <StatCard label="Grand Total" value={`${report.reduce((s, r) => s + (r['Morning Food (kg)'] || 0) + (r['Evening Food (kg)'] || 0), 0).toFixed(1)} kg`} color="#00ff88" bg="rgba(0,255,136,0.05)" />
                                <StatCard label="Avg / Elephant" value={`${(report.reduce((s, r) => s + (r['Morning Food (kg)'] || 0) + (r['Evening Food (kg)'] || 0), 0) / report.length).toFixed(1)} kg`} color="#f472b6" />
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        {['Elephant', 'Morning (kg)', 'Evening (kg)', 'AI Remark'].map(h => (
                                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '12px', fontWeight: 600 }}>{row['Elephant']}</td>
                                            <td style={{ padding: '12px', color: '#ffaa00' }}>{row['Morning Food (kg)']?.toFixed(1)}</td>
                                            <td style={{ padding: '12px', color: '#818cf8' }}>{row['Evening Food (kg)']?.toFixed(1)}</td>
                                            <td style={{ padding: '12px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>{row['AI Remark']}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )
                )}
            </div>
        </div>
    );
}

// ─── Elephant-specific Food Chain view ───────────────────────────────────────
function ElephantFoodChain({ id, data }) {
    const [formData, setFormData] = useState({
        temperature_c: 28.0, humidity_percent: 65.0, activity_score: 1.0,
        health_status: 'Healthy', morning_food_kg: '', evening_food_kg: '',
        ai_remark: 'Manually logged meal.', date: new Date().toISOString().split('T')[0]
    });
    const [aiRec, setAiRec] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [activeTab, setActiveTab] = useState('log');
    const [submitMsg, setSubmitMsg] = useState('');

    useEffect(() => {
        api.get(`/food/history/${id}`).then(r => setHistory(r.data)).catch(console.error);
        api.get(`/food/forecast/${id}`).then(r => setForecast(r.data)).catch(console.error);
    }, [id]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const getAiRecommendation = async () => {
        setAiLoading(true);
        try {
            const r = await api.post('/food/ai-recommend', { elephant_id: parseInt(id), ...formData });
            setAiRec(r.data);
            setFormData(f => ({
                ...f,
                morning_food_kg: r.data.morning_kg,
                evening_food_kg: r.data.evening_kg,
                ai_remark: r.data.remark
            }));
        } catch (e) { console.error(e); }
        setAiLoading(false);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post(`/elephants/${id}/food`, formData);
            setSubmitMsg('✅ Feeding record saved!');
            const r = await api.get(`/food/history/${id}`);
            setHistory(r.data);
            setTimeout(() => setSubmitMsg(''), 3000);
        } catch (err) { setSubmitMsg('❌ Failed to save.'); }
    };

    const tabStyle = active => ({
        padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
        background: active ? 'var(--primary-accent)' : 'rgba(255,255,255,0.07)',
        color: active ? '#000' : '#fff', transition: 'all 0.2s'
    });

    return (
        <div className="container" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[['log', '📝 Log Feeding'], ['ai', '🪄 AI Recommendation'], ['history', '📋 History'], ['forecast', '📅 7-Day Forecast']].map(([key, label]) => (
                    <button key={key} style={tabStyle(activeTab === key)} onClick={() => setActiveTab(key)}>{label}</button>
                ))}
            </div>

            {/* ── Tab: Log Feeding ── */}
            {activeTab === 'log' && (
                <div className="glass-card">
                    <h3>Add Daily Feeding Record</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Log the actual food consumed by <strong>{data.elephant.name}</strong> today.</p>
                    <form onSubmit={handleSubmit} className="health-form">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group"><label>Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Temp (°C)</label><input type="number" step="0.1" name="temperature_c" value={formData.temperature_c} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Humidity (%)</label><input type="number" step="1" name="humidity_percent" value={formData.humidity_percent} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Health Status</label>
                                <select name="health_status" value={formData.health_status} onChange={handleChange}>
                                    <option>Healthy</option><option>Weak</option><option>Recovering</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group"><label>Morning Food (KG)</label><input type="number" step="0.1" name="morning_food_kg" value={formData.morning_food_kg} onChange={handleChange} placeholder="e.g. 90" required /></div>
                            <div className="form-group"><label>Evening Food (KG)</label><input type="number" step="0.1" name="evening_food_kg" value={formData.evening_food_kg} onChange={handleChange} placeholder="e.g. 60" required /></div>
                            <div className="form-group"><label>Activity Multiplier</label><input type="number" step="0.1" name="activity_score" value={formData.activity_score} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Caretaker Remarks</label>
                            <input type="text" name="ai_remark" value={formData.ai_remark} onChange={handleChange} />
                        </div>
                        {submitMsg && <div style={{ marginBottom: '1rem', color: submitMsg.startsWith('✅') ? '#00ff88' : '#ff0040' }}>{submitMsg}</div>}
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#4caf50' }}>💾 Log Feeding Data</button>
                    </form>
                </div>
            )}

            {/* ── Tab: AI Recommendation ── */}
            {activeTab === 'ai' && (
                <div className="glass-card">
                    <h3>🪄 AI Food Recommendation</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enter today's conditions and the AI will calculate the optimal meal plan for <strong>{data.elephant.name}</strong>.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[['temperature_c', 'Temperature (°C)', 'number'], ['humidity_percent', 'Humidity (%)', 'number'], ['activity_score', 'Activity Multiplier', 'number']].map(([name, label, type]) => (
                            <div className="form-group" key={name}>
                                <label>{label}</label>
                                <input type={type} step="0.1" name={name} value={formData[name]} onChange={handleChange} />
                            </div>
                        ))}
                        <div className="form-group">
                            <label>Health Status</label>
                            <select name="health_status" value={formData.health_status} onChange={handleChange}>
                                <option>Healthy</option><option>Weak</option><option>Recovering</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={getAiRecommendation} disabled={aiLoading} style={{ marginBottom: '1.5rem' }}>
                        {aiLoading ? 'Calculating…' : '🪄 Generate Recommended Meal'}
                    </button>

                    {aiRec && (
                        <div style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '10px', padding: '1.5rem' }}>
                            <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>✅ AI Recommended Diet for {data.elephant.name}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <StatCard label="Morning" value={`${aiRec.morning_kg} kg`} color="#ffaa00" />
                                <StatCard label="Evening" value={`${aiRec.evening_kg} kg`} color="#818cf8" />
                                <StatCard label="Total" value={`${aiRec.total_kg} kg`} color="#00ff88" bg="rgba(0,255,136,0.05)" />
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', borderLeft: '3px solid #00ff88', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                💡 {aiRec.remark}
                            </div>
                            <button className="btn btn-primary" onClick={() => { setActiveTab('log'); }} style={{ marginTop: '1rem', background: '#4caf50' }}>
                                📝 Use These Values to Log
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: History ── */}
            {activeTab === 'history' && (
                <div className="glass-card">
                    <h3>📋 Feeding History (Last 30 Records)</h3>
                    {history.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No feeding records yet.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    {['Date', 'Morning (kg)', 'Evening (kg)', 'Total (kg)', 'Health', 'Temp', 'Remark'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{row.date}</td>
                                        <td style={{ padding: '10px 12px', color: '#ffaa00' }}>{row.morning_food_kg?.toFixed(1)}</td>
                                        <td style={{ padding: '10px 12px', color: '#818cf8' }}>{row.evening_food_kg?.toFixed(1)}</td>
                                        <td style={{ padding: '10px 12px', color: '#00ff88', fontWeight: 700 }}>{((row.morning_food_kg || 0) + (row.evening_food_kg || 0)).toFixed(1)}</td>
                                        <td style={{ padding: '10px 12px' }}><span className={`status-badge status-${row.health_status === 'Healthy' ? 'Healthy' : 'Warning'}`} style={{ margin: 0, fontSize: '0.75rem' }}>{row.health_status || '–'}</span></td>
                                        <td style={{ padding: '10px 12px' }}>{row.temperature_c}°C</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>{row.ai_remark}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── Tab: 7-Day Forecast ── */}
            {activeTab === 'forecast' && (
                <div className="glass-card">
                    <h3>📅 7-Day Feeding Forecast for {data.elephant.name}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>AI-projected feeding plan based on stable conditions. Adjust daily based on actual observations.</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                {['Date', 'Morning (kg)', 'Evening (kg)', 'Total (kg)', 'Morning Schedule', 'Evening Schedule', 'AI Note'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {forecast.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i === 0 ? 'rgba(0,255,136,0.03)' : 'transparent' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: 700, color: i === 0 ? '#00ff88' : '#fff' }}>{row.date}{i === 0 && ' (Today)'}</td>
                                    <td style={{ padding: '10px 12px', color: '#ffaa00' }}>{row.morning_kg}</td>
                                    <td style={{ padding: '10px 12px', color: '#818cf8' }}>{row.evening_kg}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{row.total_kg}</td>
                                    <td style={{ padding: '10px 12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row.morning_schedule}</td>
                                    <td style={{ padding: '10px 12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row.evening_schedule}</td>
                                    <td style={{ padding: '10px 12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{row.remark}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '1rem' }}>💡 This is an AI projection. Actual feeding should be adjusted daily based on real-time observations.</p>
                </div>
            )}
        </div>
    );
}

// ─── Main FoodChain page component ───────────────────────────────────────────
function FoodChain() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) { setLoading(false); return; }
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/elephants/${id}`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401) navigate('/login');
                else { console.error(err); setLoading(false); }
            }
        };
        fetchProfile();
    }, [id, navigate]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading…</div>;

    if (!id) return <FoodChainOverview />;

    return (
        <div>
            <div className="container" style={{ paddingBottom: 0 }}>
                {data && (
                    <ProfileHeader
                        elephant={data.elephant}
                        latest_status={data.latest_status}
                        latest_diagnosis={data.latest_diagnosis}
                        risk_details={data.risk_details}
                    />
                )}
            </div>
            {data && <ElephantFoodChain id={id} data={data} />}
        </div>
    );
}

export default FoodChain;
