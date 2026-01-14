"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/store";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const login = useAuth((state) => state.login);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        country: "",
        email: "",
        phone: "",
        password: "", // New State
        tickets_count: 1
    });

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:8000/visitors/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    age: parseInt(formData.age),
                    booking_date: new Date().toISOString(), // Default to now
                    event_interest: "General Entry" // Default event
                }),
            });

            const data = await res.json();

            if (data.status === "success") {
                // Auto-login with returned ID
                login(data.visitor_id, formData.name);
                router.push("/profile");
            } else {
                setError("Registration failed. Please try again.");
            }

        } catch (err) {
            setError("Network error. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-earth-100 flex items-center justify-center p-4">
            <div className="bg-white text-jungle-900 w-full max-w-2xl p-8 rounded-3xl shadow-2xl relative">
                <Link href="/" className="absolute top-6 left-6 text-jungle-900/50 hover:text-jungle-900 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-earth-500 rounded-2xl mx-auto flex items-center justify-center mb-4 text-jungle-900 shadow-lg">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-jungle-900">Create Account</h1>
                    <p className="text-jungle-900/60">Join the Pinnawala Community</p>
                </div>

                <form onSubmit={handleRegister} className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Full Name</label>
                        <input
                            required
                            className="w-full p-4 rounded-xl bg-earth-100/30 border border-jungle-900/10 focus:border-earth-500 outline-none"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Email</label>
                        <input
                            type="email" required
                            className="w-full p-4 rounded-xl bg-earth-100/30 border border-jungle-900/10 focus:border-earth-500 outline-none"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Country</label>
                        <select
                            required
                            className="w-full p-4 rounded-xl bg-earth-100/30 border border-jungle-900/10 focus:border-earth-500 outline-none appearance-none"
                            value={formData.country}
                            onChange={e => setFormData({ ...formData, country: e.target.value })}
                        >
                            <option value="">Select Country</option>
                            <option value="Sri Lanka">Sri Lanka</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Germany">Germany</option>
                            <option value="India">India</option>
                            <option value="China">China</option>
                            <option value="Australia">Australia</option>
                            {/* Add more as needed */}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Phone</label>
                        <input
                            required
                            className="w-full p-4 rounded-xl bg-earth-100/30 border border-jungle-900/10 focus:border-earth-500 outline-none"
                            placeholder="+94..."
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Password</label>
                        <input
                            type="password" required minLength={6}
                            className="w-full p-4 rounded-xl bg-earth-100/30 border border-jungle-900/10 focus:border-earth-500 outline-none"
                            placeholder="******"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Age</label>
                        <input
                            type="number" required min="1" max="120"
                            className="w-full p-4 rounded-xl bg-earth-100/30 border border-jungle-900/10 focus:border-earth-500 outline-none"
                            value={formData.age}
                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Initial Tickets</label>
                        <input
                            type="number" required min="1" max="10"
                            className="w-full p-4 rounded-xl bg-earth-100/30 border border-jungle-900/10 focus:border-earth-500 outline-none"
                            value={formData.tickets_count}
                            onChange={e => setFormData({ ...formData, tickets_count: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="md:col-span-2 pt-4">
                        {error && (
                            <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center font-medium mb-4">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-jungle-800 hover:bg-jungle-900 text-ivory font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Create Profile & Get Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
