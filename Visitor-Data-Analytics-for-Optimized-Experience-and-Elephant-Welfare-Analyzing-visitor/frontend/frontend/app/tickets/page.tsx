"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import { ArrowLeft, Check, Info } from "lucide-react";

export default function TicketsPage() {
    const router = useRouter();
    const { visitorId } = useAuth();

    const handleBook = (type: string, price: string) => {
        if (visitorId) {
            // User is logged in -> Go to Checkout
            router.push(`/checkout?type=${encodeURIComponent(type)}&price=${encodeURIComponent(price)}`);
        } else {
            // User needs to register/login
            router.push("/register");
        }
    };

    return (
        <main className="min-h-screen bg-ivory text-jungle-900 font-sans pb-20">
            {/* HEADER */}
            <nav className="p-6 sticky top-0 bg-ivory/90 backdrop-blur-md z-50 border-b border-jungle-900/5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-jungle-900 font-bold hover:text-earth-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Return Home
                </Link>
                {!visitorId && (
                    <Link href="/login" className="text-sm font-bold text-earth-500 hover:underline">
                        Already have an account? Log In
                    </Link>
                )}
                {visitorId && (
                    <Link href="/profile" className="text-sm font-bold text-jungle-900 bg-earth-100 px-4 py-2 rounded-full hover:bg-earth-200">
                        My Profile
                    </Link>
                )}
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16 space-y-4">
                    <span className="bg-earth-100 text-earth-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        2025 Official Rates
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-jungle-900">
                        Choose Your Experience
                    </h1>
                    <p className="text-xl text-jungle-900/60 max-w-2xl mx-auto">
                        All tickets include full-day access to the orphanage, river bathing sessions, and fruit feeding observation.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    {/* CARD 1: LOCAL */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-earth-100 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                        <h3 className="text-xl font-bold text-jungle-900 mb-2">Sri Lankan Residents</h3>
                        <div className="flex items-baseline gap-1 my-6">
                            <span className="text-4xl font-serif font-bold text-jungle-900">LKR 250</span>
                            <span className="text-gray-500">/ adult</span>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-gray-600">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Valid NID Required</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Children (3-12): LKR 100</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Full Access</li>
                        </ul>
                        <button onClick={() => handleBook("Sri Lankan Residents", "LKR 250")} className="block w-full py-3 bg-earth-100 text-earth-900 font-bold text-center rounded-xl hover:bg-earth-200 transition-colors">
                            Book Now
                        </button>
                    </div>

                    {/* CARD 2: FOREIGN (FEATURED) */}
                    <div className="bg-jungle-900 p-8 rounded-3xl shadow-2xl border border-jungle-800 relative overflow-hidden transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-earth-500 text-jungle-900 text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                            Most Popular
                        </div>
                        <h3 className="text-xl font-bold text-ivory mb-2">International Visitor</h3>
                        <div className="flex items-baseline gap-1 my-6">
                            <span className="text-4xl font-serif font-bold text-earth-500">$15.00</span>
                            <span className="text-ivory/50">/ adult</span>
                        </div>
                        <p className="text-xs text-earth-500 mb-6 font-mono">+ 18% VAT included at checkout</p>
                        <ul className="space-y-3 mb-8 text-sm text-ivory/80">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-earth-500" /> Fast Track Entry</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-earth-500" /> Children (3-12): $7.50</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-earth-500" /> Free Guide Map</li>
                        </ul>
                        <button onClick={() => handleBook("International Visitor", "$15.00")} className="block w-full py-4 bg-earth-500 text-jungle-900 font-bold text-center rounded-xl hover:bg-earth-400 transition-colors shadow-lg">
                            Get Your Ticket
                        </button>
                    </div>

                    {/* CARD 3: SAARC */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-earth-100 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                        <h3 className="text-xl font-bold text-jungle-900 mb-2">SAARC Region</h3>
                        <div className="flex items-baseline gap-1 my-6">
                            <span className="text-4xl font-serif font-bold text-jungle-900">$10.00</span>
                            <span className="text-gray-500">/ adult</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-6 font-mono">+ 18% VAT included at checkout</p>
                        <ul className="space-y-3 mb-8 text-sm text-gray-600">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Passport Verify Req.</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Children (3-12): $5.00</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> SAARC Member Rate</li>
                        </ul>
                        <button onClick={() => handleBook("SAARC Region", "$10.00")} className="block w-full py-3 bg-earth-100 text-earth-900 font-bold text-center rounded-xl hover:bg-earth-200 transition-colors">
                            Book Now
                        </button>
                    </div>

                </div>

                {/* INFO SECTION */}
                <div className="mt-16 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start">
                    <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-jungle-900">Important Information</h4>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            Tickets are valid only for the date of booking. Please present your digital QR code at the main entrance gate.
                            For SAARC and Local rates, original identification documents (Passport/NIC) must be presented upon entry.
                            Refunds are not available for cancellations made less than 24 hours before the visit.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
