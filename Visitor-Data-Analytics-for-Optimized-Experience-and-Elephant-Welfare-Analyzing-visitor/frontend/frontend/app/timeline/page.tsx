"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Users, Clock, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Event {
    _id: string;
    event_name: string;
    description: string;
    category: string; // Observation, Interaction, Cultural, Special
    capacity: number;
    current_count: number;
}

export default function TimelinePage() {
    const router = useRouter();
    const { visitorId } = useAuth();
    const [dailyEvents, setDailyEvents] = useState<Event[]>([]);
    const [specialEvents, setSpecialEvents] = useState<Event[]>([]);
    const [activeSession, setActiveSession] = useState<string | null>(null); // Event ID user is currently checked into
    const [loading, setLoading] = useState(true);

    // Poll for live updates
    useEffect(() => {
        if (!visitorId) {
            router.push("/login");
            return;
        }

        // Initial Fetch
        fetchEvents();

        // Polling every 5 seconds for live crowd counts
        const interval = setInterval(fetchEvents, 5000);
        return () => clearInterval(interval);
    }, [visitorId]);

    async function fetchEvents() {
        try {
            const res = await fetch("http://localhost:8000/events/");
            const data = await res.json();
            if (data.status === "success") {
                setDailyEvents(data.daily_timetable);
                setSpecialEvents(data.special_events);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCheckIn(eventId: string) {
        if (activeSession) {
            alert("Please check out of your current location first!");
            return;
        }
        try {
            await fetch(`http://localhost:8000/events/${eventId}/checkin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visitor_id: visitorId })
            });
            setActiveSession(eventId);
            fetchEvents(); // Refresh counts immediate
        } catch (err) { console.error(err); }
    }

    async function handleCheckOut(eventId: string) {
        try {
            await fetch(`http://localhost:8000/events/${eventId}/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visitor_id: visitorId })
            });
            setActiveSession(null);
            fetchEvents();
        } catch (err) { console.error(err); }
    }

    return (
        <main className="min-h-screen bg-jungle-900 text-ivory font-sans pb-20">
            {/* HEADER */}
            <nav className="p-6 sticky top-0 bg-jungle-900/90 backdrop-blur-md z-50 border-b border-white/5 flex items-center justify-between">
                <Link href="/profile" className="flex items-center gap-2 text-earth-500 font-bold hover:text-earth-100 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Profile
                </Link>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-xs uppercase tracking-widest font-bold">Live Feed</span>
                </div>
            </nav>

            <header className="p-8 text-center max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Today's Timeline</h1>
                <p className="text-white/60 text-lg">
                    Track real-time elephant movements and crowd levels. Check in to contribute to the data!
                </p>
            </header>

            {/* TIMELINE */}
            <div className="max-w-3xl mx-auto px-4 relative mt-8">
                {/* Vertical Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-earth-500/0 via-earth-500/50 to-earth-500/0 md:-ml-px"></div>

                <div className="space-y-12 mb-20">
                    {dailyEvents.map((event, index) => {
                        const isCheckedIn = activeSession === event._id;
                        const occupancy = (event.current_count / event.capacity) * 100;
                        const isCrowded = occupancy > 80;

                        return (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative flex flex-col md:flex-row gap-8 items-center",
                                    index % 2 === 0 ? "md:flex-row-reverse text-left md:text-right" : "text-left"
                                )}
                            >
                                {/* Time/Marker */}
                                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-jungle-900 border-4 border-earth-500 rounded-full md:-translate-x-1/2 z-10 shadow-[0_0_15px_rgba(212,163,115,0.6)]"></div>

                                {/* Content Card */}
                                <div className={cn(
                                    "ml-16 md:ml-0 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 w-full md:w-[45%] hover:bg-white/10 transition-colors shadow-xl group",
                                    isCheckedIn ? "border-earth-500 ring-1 ring-earth-500 bg-earth-500/20" : ""
                                )}>
                                    <div className={cn("text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2", index % 2 === 0 ? "md:justify-end" : "justify-start")}>
                                        <span className="text-earth-500">{event.category}</span>
                                        {isCheckedIn && <span className="text-green-400 animate-pulse">• You are here</span>}
                                    </div>

                                    <h3 className="text-2xl font-bold font-serif mb-2">{event.event_name}</h3>
                                    <p className="text-sm text-white/50 mb-4">{event.description}</p>

                                    {/* Crowd Meter */}
                                    <div className="space-y-1 mb-6">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="flex items-center gap-1 text-white/70">
                                                <Users className="w-3 h-3" /> Crowd Level
                                            </span>
                                            <span className={cn(isCrowded ? "text-red-400" : "text-green-400")}>
                                                {event.current_count} Visitors
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000", isCrowded ? "bg-red-500" : "bg-emerald-500")}
                                                style={{ width: `${Math.min(occupancy, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className={cn("flex", index % 2 === 0 ? "md:justify-end" : "justify-start")}>
                                        {isCheckedIn ? (
                                            <button
                                                onClick={() => handleCheckOut(event._id)}
                                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 text-sm font-bold rounded-lg border border-red-500/50 flex items-center gap-2 transition-all"
                                            >
                                                <LogOut className="w-4 h-4" /> Check Out
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleCheckIn(event._id)}
                                                disabled={!!activeSession}
                                                className="px-4 py-2 bg-earth-500 hover:bg-earth-400 text-jungle-900 text-sm font-bold rounded-lg transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                                            >
                                                <LogIn className="w-4 h-4" /> Check In here
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* SPECIAL EVENTS SECTION */}
                <div className="mt-20 pt-10 border-t border-white/10 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-earth-500">✨ Upcoming Special Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {specialEvents.map((event) => (
                            <div key={event._id} className="bg-jungle-800/50 p-6 rounded-2xl border border-earth-500/20 hover:border-earth-500/50 transition-all group">
                                <div className="text-earth-500 mb-4 flex justify-center">
                                    <div className="p-3 bg-earth-500/10 rounded-full group-hover:bg-earth-500/20 transition-colors">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold font-serif mb-2">{event.event_name}</h3>
                                <p className="text-sm text-earth-100/70 mb-4">{event.description}</p>
                                <div className="text-xs font-bold uppercase tracking-widest text-earth-600 bg-earth-500/10 py-1 px-3 rounded-full inline-block">
                                    {event.category}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
