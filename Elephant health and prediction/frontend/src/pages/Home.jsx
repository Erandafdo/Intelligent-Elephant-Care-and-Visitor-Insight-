import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="landing-page">
            <nav className="glass-nav">
                <div className="container navbar">
                    <div className="logo">Elephant <span>Health Detector</span></div>
                    <div>
                        <Link to="/login" className="btn btn-outline">Vet Login</Link>
                    </div>
                </div>
            </nav>

            <header className="hero-section">
                <div className="container hero-content">
                    <h1>Protecting Giants with <br /><span>Artificial Intelligence</span></h1>
                    <p>A state-of-the-art health monitoring system for the Pinnawala Elephant Orphanage. detecting risks early to ensure a healthier future.</p>
                    <div className="hero-buttons">
                        <Link to="/login" className="btn btn-primary">Go to Dashboard</Link>
                        <a href="#features" className="btn btn-outline">Learn More</a>
                    </div>
                </div>
            </header>

            <section id="features" className="features-section">
                <div className="container">
                    <h2 className="section-title">Why Pinnawala AI?</h2>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="icon">🔍</div>
                            <h3>Early Diagnosis</h3>
                            <p>AI algorithms analyze physiological data to predict health risks like Infection, Dehydration, and Arthritis before they become critical.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon">📊</div>
                            <h3>Real-time Monitoring</h3>
                            <p>Track vital signs daily. Instant visual alerts ensure that veterinarians can take immediate action.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon">🐘</div>
                            <h3>Individual Profiles</h3>
                            <p>Comprehensive history and specific health insights for every elephant in the orphanage.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="container">
                    <p>&copy; 2025 Pinnawala Elephant Orphanage. Powered by AI.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
