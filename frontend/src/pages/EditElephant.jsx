import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function EditElephant() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '', age: '', gender: 'Male', weight: '', height: '', image_url: '', notes: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/elephants/${id}`);
                const elephant = res.data.elephant;
                setFormData({
                    name: elephant.name,
                    age: elephant.age,
                    gender: elephant.gender,
                    weight: elephant.weight_kg,
                    height: elephant.height_m,
                    image_url: elephant.image_url,
                    notes: elephant.special_notes
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchProfile();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/elephants/${id}`, formData);
            navigate(`/profile/${id}`);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center' }}>Loading Form...</div>;

    return (
        <div className="container">
            <Link to={`/profile/${id}`} style={{ color: '#fff', fontWeight: 600, display: 'inline-block', marginBottom: '2rem' }}>← Cancel Edit</Link>

            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '2rem' }}>Edit {formData.name}'s Profile</h1>

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
                            <input type="number" step="0.1" name="weight" value={formData.weight || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Estimated Height (Meters)</label>
                            <input type="number" step="0.1" name="height" value={formData.height || ''} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Special Notes / Medical History</label>
                        <textarea name="notes" rows="4" value={formData.notes || ''} onChange={handleChange}></textarea>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Save Changes</button>
                </form>
            </div>
        </div>
    );
}

export default EditElephant;
