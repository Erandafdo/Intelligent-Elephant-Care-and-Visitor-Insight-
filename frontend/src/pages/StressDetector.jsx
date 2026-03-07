import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../pages/Dashboard.css';

const STRESS_API_URL = import.meta.env.VITE_STRESS_API_URL || 'https://inuridinethma-esl-api.hf.space/predict';
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

function toPercent(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
}

function parsePrediction(data) {
    const predictionText = typeof data?.prediction === 'string' ? data.prediction : '';
    const stressProb = typeof data?.probs?.stress === 'number' ? data.probs.stress : null;
    const normalProb = typeof data?.probs?.normal === 'number' ? data.probs.normal : null;

    let stressed = null;
    if (stressProb !== null && normalProb !== null) {
        stressed = stressProb >= normalProb;
    } else if (stressProb !== null) {
        stressed = stressProb >= 0.5;
    } else if (predictionText) {
        const normalized = predictionText.toLowerCase();
        stressed = normalized.includes('stress') && !normalized.includes('normal');
    }

    return {
        stressed,
        predictionText,
        stressProb,
        normalProb,
        clips: typeof data?.n_clips === 'number' ? data.n_clips : null,
        raw: data
    };
}

function StressDetector() {
    const { id } = useParams();
    const [videoFile, setVideoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!videoFile) {
            setPreviewUrl('');
            return;
        }

        const objectUrl = URL.createObjectURL(videoFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [videoFile]);

    const status = useMemo(() => {
        if (!result) return null;
        if (result.stressed === true) return 'Stress Detected';
        if (result.stressed === false) return 'No Stress Detected';
        return 'Result Unclear';
    }, [result]);

    const resultBadgeClass = useMemo(() => {
        if (!result) return 'status-Unknown';
        if (result.stressed === true) return 'status-Critical';
        if (result.stressed === false) return 'status-Healthy';
        return 'status-Unknown';
    }, [result]);

    const handleVideoChange = (event) => {
        const file = event.target.files?.[0];
        setResult(null);
        setError('');
        setVideoFile(file || null);
    };

    const handleAnalyze = async () => {
        if (!videoFile) {
            setError('Please upload a video first.');
            return;
        }

        setIsAnalyzing(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', videoFile);

            const headers = {};
            if (HF_TOKEN) {
                headers.Authorization = `Bearer ${HF_TOKEN}`;
            }

            const response = await fetch(STRESS_API_URL, {
                method: 'POST',
                headers,
                body: formData
            });

            const responseBody = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(responseBody?.detail || 'Model request failed.');
            }

            setResult(parsePrediction(responseBody));
        } catch (requestError) {
            setError(requestError.message || 'Failed to analyze video.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <h1>Stress Detector Monitoring</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
                Upload an elephant video and run model analysis from Hugging Face Space.
            </p>
            {id && (
                <p style={{ color: 'var(--text-muted)' }}>
                    Selected Elephant ID: <strong style={{ color: '#fff' }}>#{id}</strong>
                </p>
            )}

            <div className="dashboard-grid">
                <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                    <h2>Video Upload</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Supported: MP4, MOV, WEBM, MKV
                    </p>

                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        style={{ marginBottom: '1rem' }}
                    />

                    {previewUrl ? (
                        <video
                            src={previewUrl}
                            controls
                            style={{
                                width: '100%',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                background: '#000',
                                maxHeight: '420px'
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                border: '1px dashed var(--glass-border)',
                                borderRadius: '12px',
                                minHeight: '180px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)',
                                background: 'rgba(255,255,255,0.02)'
                            }}
                        >
                            No video selected
                        </div>
                    )}

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button className="btn" onClick={handleAnalyze} disabled={isAnalyzing || !videoFile}>
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Stress'}
                        </button>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            API: {STRESS_API_URL}
                        </span>
                    </div>
                </div>

                <div className="glass-card">
                    <h2>Prediction Result</h2>

                    {error && (
                        <div
                            style={{
                                marginTop: '1rem',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                background: 'rgba(255, 0, 64, 0.2)',
                                border: '1px solid rgba(255, 0, 64, 0.45)',
                                color: '#ff8fa8'
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {!error && !result && (
                        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                            Upload a video and click Analyze Stress to see whether the elephant is stressed.
                        </p>
                    )}

                    {result && (
                        <div style={{ marginTop: '1rem' }}>
                            <div
                                className={`status-badge ${resultBadgeClass}`}
                                style={{ margin: 0 }}
                            >
                                {status}
                            </div>

                            <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                                <div>Model Label: <strong style={{ color: '#fff' }}>{result.predictionText || 'N/A'}</strong></div>
                                <div>Stress Confidence: <strong style={{ color: '#fff' }}>{toPercent(result.stressProb)}</strong></div>
                                <div>Normal Confidence: <strong style={{ color: '#fff' }}>{toPercent(result.normalProb)}</strong></div>
                                <div>Clips Processed: <strong style={{ color: '#fff' }}>{result.clips ?? 'N/A'}</strong></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StressDetector;
