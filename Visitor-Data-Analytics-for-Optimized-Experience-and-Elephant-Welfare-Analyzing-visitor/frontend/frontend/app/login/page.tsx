"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/store"; // Correct import path
import { ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const login = useAuth((state) => state.login);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:8000/visitors/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Invalid credentials");
            }

            if (data.status === "success") {
                login(data.visitor_id, data.name);
                router.push("/profile");
            }
        } catch (err: any) {
            setError(err.message || "Login failed. Check your connection.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-jungle-900 flex items-center justify-center p-4">
            <div className="bg-ivory text-jungle-900 w-full max-w-md p-8 rounded-2xl shadow-2xl relative">
                <Link href="/" className="absolute top-4 left-4 text-jungle-900/50 hover:text-jungle-900 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>

                <h1 className="text-3xl font-serif font-bold text-center mb-2">Welcome Back</h1>
                <p className="text-center text-jungle-900/60 mb-8">Access your tickets and history</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-4 rounded-xl bg-white border border-jungle-900/10 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-4 rounded-xl bg-white border border-jungle-900/10 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-earth-500 hover:bg-earth-900 hover:text-earth-100 text-jungle-900 font-bold rounded-xl transition-all flex justify-center items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Log In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-bold text-earth-900 hover:underline">
                        Register Here
                    </Link>
                </div>
            </div>
        </div>
    );
}
