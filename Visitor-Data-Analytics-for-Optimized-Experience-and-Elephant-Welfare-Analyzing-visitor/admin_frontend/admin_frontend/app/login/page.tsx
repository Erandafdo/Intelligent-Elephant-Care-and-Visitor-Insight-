"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("admin@pinnawala.lk");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        setTimeout(() => {
            if (password === "admin123") {
                localStorage.setItem("admin_auth", "true");
                router.push("/");
            } else {
                setError("Invalid credentials. Try 'admin123'");
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: '#FEFAE0'
        }}>
            <div style={{ width: '100%', maxWidth: '450px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        margin: '0 auto 20px',
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, #1A4D2E 0%, #276F43 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(13, 43, 26, 0.2)'
                    }}>
                        <Lock style={{ width: '35px', height: '35px', color: 'white' }} />
                    </div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#0D2B1A',
                        margin: '0 0 8px 0'
                    }}>
                        Admin Portal
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: '#8B5E3C',
                        margin: 0
                    }}>
                        Sign in to access the dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px rgba(13, 43, 26, 0.08), 0 2px 4px rgba(13, 43, 26, 0.04)',
                    border: '1px solid #FAEDCD'
                }}>
                    <form onSubmit={handleLogin}>
                        {/* Email Field */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#0D2B1A',
                                marginBottom: '10px'
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '20px',
                                    height: '20px',
                                    color: '#8B5E3C'
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 48px',
                                        fontSize: '15px',
                                        border: '2px solid #FAEDCD',
                                        borderRadius: '12px',
                                        background: '#FEFAE0',
                                        color: '#0D2B1A',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#D4A373'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#FAEDCD'}
                                    placeholder="admin@pinnawala.lk"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#0D2B1A',
                                marginBottom: '10px'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '20px',
                                    height: '20px',
                                    color: '#8B5E3C'
                                }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 48px',
                                        fontSize: '15px',
                                        border: '2px solid #FAEDCD',
                                        borderRadius: '12px',
                                        background: '#FEFAE0',
                                        color: '#0D2B1A',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#D4A373'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#FAEDCD'}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                padding: '14px',
                                marginBottom: '24px',
                                background: '#FEE2E2',
                                border: '2px solid #FCA5A5',
                                borderRadius: '12px',
                                color: '#DC2626',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                border: 'none',
                                borderRadius: '12px',
                                background: loading ? '#8B5E3C' : '#D4A373',
                                color: '#0D2B1A',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 12px rgba(212, 163, 115, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#8B5E3C';
                                    e.currentTarget.style.color = '#FEFAE0';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 94, 60, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#D4A373';
                                    e.currentTarget.style.color = '#0D2B1A';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 163, 115, 0.3)';
                                }
                            }}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* Footer */}
                    <div style={{
                        marginTop: '30px',
                        paddingTop: '24px',
                        borderTop: '1px solid #FAEDCD',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '13px',
                            color: '#8B5E3C',
                            margin: 0
                        }}>
                            🔒 Secured by Pinnawala Analytics System
                        </p>
                    </div>
                </div>

                {/* Help Text */}
                <p style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#8B5E3C',
                    marginTop: '24px'
                }}>
                    Demo password: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#0D2B1A' }}>admin123</span>
                </p>
            </div>
        </div>
    );
}
