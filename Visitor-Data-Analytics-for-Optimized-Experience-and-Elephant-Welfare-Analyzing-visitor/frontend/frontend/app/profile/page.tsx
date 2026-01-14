"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, QrCode, LogOut, Ticket, Loader2 } from "lucide-react";
import Link from "next/link";

interface TicketData {
    _id: string;
    event_name: string;
    tickets_count: number;
    total_price: number;
    currency: string;
    qr_code_data: string;
    status: string;
    booking_date: string;
}

interface HistoryEntry {
    event_name: string;
    check_in: string;
    check_out: string | null;
    minutes_spent: number;
}

interface VisitorHistoryResponse {
    visitor: string; // Name
    tickets: TicketData[];
    journey_history: HistoryEntry[];
    active_sessions: any[];
}

export default function ProfilePage() {
    const router = useRouter();
    const { visitorId, logout } = useAuth();
    const [data, setData] = useState<VisitorHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!visitorId) {
            router.push("/login"); // Protect Route
            return;
        }

        async function fetchHistory() {
            try {
                const res = await fetch(`http://localhost:8000/visitors/${visitorId}/history`);
                if (!res.ok) throw new Error("Failed to fetch history");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [visitorId, router]);

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-ivory flex items-center justify-center text-jungle-900">
                <Loader2 className="w-10 h-10 animate-spin text-earth-500" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-ivory text-jungle-900 font-sans pb-20">
            {/* HEADER */}
            <header className="bg-jungle-900 text-ivory p-8 pt-12 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern-bg.png')] opacity-5" />

                <div className="max-w-4xl mx-auto relative z-10 flex justify-between items-start">
                    <Link href="/" className="bg-ivory/10 hover:bg-ivory/20 p-2 rounded-full transition-colors backdrop-blur-md">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <button
                        onClick={() => { logout(); router.push("/"); }}
                        className="text-earth-500 hover:text-earth-100 font-bold text-sm tracking-widest uppercase flex items-center gap-2"
                    >
                        Log Out <LogOut className="w-4 h-4" />
                    </button>
                </div>

                <div className="max-w-4xl mx-auto mt-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-end gap-4"
                    >
                        <div className="w-20 h-20 bg-earth-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-jungle-900 shadow-lg transform rotate-3">
                            {data.visitor.charAt(0)}
                        </div>
                        <div>
                            <p className="text-earth-500 font-bold uppercase tracking-wider text-sm mb-1">Explorer Profile</p>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold">{data.visitor}</h1>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* CONTENT GRID */}
            <div className="max-w-4xl mx-auto px-6 mt-12 grid md:grid-cols-2 gap-12">

                {/* LEFT COL: WALLET */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                            <Ticket className="text-earth-500" /> My Wallet
                        </h2>
                        <Link href="/tickets" className="text-xs font-bold bg-earth-500 text-jungle-900 px-3 py-1.5 rounded-lg hover:bg-earth-400 transition-colors shadow-md flex items-center gap-1">
                            + Buy New
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {data.tickets.length === 0 ? (
                            <div className="p-6 bg-earth-100/50 rounded-2xl text-center border border-dashed border-earth-900/20">
                                No tickets yet. Time to explore!
                            </div>
                        ) : (
                            data.tickets.map((ticket) => (
                                <div key={ticket._id} className="bg-white p-0 rounded-2xl shadow-xl overflow-hidden border border-earth-100 group hover:scale-[1.02] transition-transform">
                                    <div className="bg-jungle-800 p-4 flex justify-between items-center text-ivory">
                                        <span className="font-bold tracking-wide uppercase text-sm">Entry Pass</span>
                                        <span className="bg-earth-500 text-jungle-900 text-xs font-bold px-2 py-1 rounded">{ticket.status}</span>
                                    </div>
                                    <div className="p-6 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg text-jungle-900">{ticket.event_name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(ticket.booking_date).toLocaleDateString()} • {ticket.tickets_count} Guest(s)
                                            </p>
                                            <p className="text-earth-900 font-bold mt-2">
                                                {ticket.currency} {ticket.total_price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg border-2 border-dashed border-jungle-900/10">
                                            {/* Real QR Code using Public API for Demo */}
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qr_code_data}`}
                                                alt="Ticket QR"
                                                className="w-16 h-16 mix-blend-multiply"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="bg-earth-500/10 p-6 rounded-2xl border border-earth-500/20">
                        <h3 className="font-bold text-earth-900 mb-2">Pinnawala Membership</h3>
                        <p className="text-sm text-jungle-900/70">
                            Collect 500 more points to unlock Gold Tier status and exclusive river access.
                        </p>
                        <div className="w-full bg-earth-100 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-earth-500 h-full w-[20%]"></div>
                        </div>
                    </div>
                </motion.section>

                {/* RIGHT COL: HISTORY TIMELINE */}
                <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                            <Clock className="text-earth-500" /> Journey Log
                        </h2>
                        <Link href="/timeline" className="text-sm font-bold text-emerald-700 hover:underline">
                            View Live Map
                        </Link>
                    </div>

                    <div className="relative border-l-2 border-earth-100 ml-3 space-y-8 pl-8 py-2">
                        {data.journey_history.length === 0 ? (
                            <div className="text-gray-400 italic text-sm">No activity recorded yet. Check in to events!</div>
                        ) : (
                            data.journey_history.map((entry, i) => (
                                <div key={i} className="relative">
                                    <span className="absolute -left-[41px] top-0 w-6 h-6 bg-earth-100 border-4 border-white rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-earth-500 rounded-full"></div>
                                    </span>

                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-earth-100/50">
                                        <h4 className="font-bold text-jungle-900">{entry.event_name}</h4>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> In: {new Date(entry.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {entry.check_out && (
                                                <span className="text-emerald-700">
                                                    Time: {entry.minutes_spent.toFixed(1)} min
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.section>
            </div>
        </main>
    );
}
