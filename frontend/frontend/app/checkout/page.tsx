"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/store";
import { ArrowLeft, CreditCard, Loader2, Lock } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { visitorId } = useAuth();

    const type = searchParams.get("type") || "Standard Ticket";
    const price = searchParams.get("price") || "Calculated at Checkout";

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handlePayment(e: React.FormEvent) {
        e.preventDefault();
        if (!visitorId) return;

        setLoading(true);

        // Simulate Payment Gateway Delay
        await new Promise(r => setTimeout(r, 2000));

        try {
            // Call Backend to Create Ticket
            const res = await fetch(`http://localhost:8000/visitors/${visitorId}/tickets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking_date: new Date().toISOString(),
                    tickets_count: 1, // Default 1 for now
                    event_preference: type
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/profile"), 2000);
            } else {
                // Handle 404/500 errors
                setLoading(false);
                alert("Transaction Failed: Backend Error");
            }
        } catch (err) {
            alert("Payment Failed");
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-earth-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl animate-bounce">
                        <Lock className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-jungle-900">Payment Successful!</h2>
                    <p className="text-jungle-900/60">Your ticket has been added to your wallet.</p>
                    <p className="text-sm text-gray-400">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ivory text-jungle-900">
            <nav className="p-6 border-b border-jungle-900/5">
                <Link href="/tickets" className="flex items-center gap-2 font-bold hover:text-earth-500">
                    <ArrowLeft className="w-5 h-5" /> Cancel
                </Link>
            </nav>

            <div className="max-w-xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-serif font-bold mb-8">Secure Checkout</h1>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-earth-100 mb-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Order Summary</h3>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>{type}</span>
                        <span>{price}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-green-500" /> SSL Encrypted Transaction
                    </div>
                </div>

                {/* Mock Payment Form */}
                <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Card Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                required
                                placeholder="0000 0000 0000 0000"
                                className="w-full pl-12 p-4 rounded-xl bg-white border border-jungle-900/10 outline-none focus:border-earth-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Expiry</label>
                            <input
                                required
                                placeholder="MM/YY"
                                className="w-full p-4 rounded-xl bg-white border border-jungle-900/10 outline-none focus:border-earth-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">CVC</label>
                            <input
                                required
                                placeholder="123"
                                className="w-full p-4 rounded-xl bg-white border border-jungle-900/10 outline-none focus:border-earth-500"
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-jungle-900 text-ivory font-bold rounded-xl shadow-xl hover:bg-jungle-800 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Pay Now"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
