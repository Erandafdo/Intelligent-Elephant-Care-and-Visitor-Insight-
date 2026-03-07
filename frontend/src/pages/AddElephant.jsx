import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function AddElephant() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        weight: '',
        height: '',
        image_url: '',
        base_health_score: 80,
        activity_level: 'Medium',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/elephants', formData);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container">
            <Link to="/dashboard" style={{ color: '#fff', fontWeight: 600, display: 'inline-block', marginBottom: '2rem' }}>← Back to Dashboard</Link>

            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '2rem' }}>Add New Elephant Profile</h1>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Age</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Image URL</label>
                            <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Estimated Weight (KG)</label>
                            <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Estimated Height (Meters)</label>
                            <input type="number" step="0.1" name="height" value={formData.height} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Base Health Score</label>
                            <input type="number" min="1" max="100" name="base_health_score" value={formData.base_health_score} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Activity Level</label>
                            <select name="activity_level" value={formData.activity_level} onChange={handleChange} required>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Special Notes / Medical History</label>
                        <textarea name="notes" rows="4" value={formData.notes} onChange={handleChange}></textarea>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Create Profile</button>
                </form>
            </div>
        </div>
    );
}

export default AddElephant;
