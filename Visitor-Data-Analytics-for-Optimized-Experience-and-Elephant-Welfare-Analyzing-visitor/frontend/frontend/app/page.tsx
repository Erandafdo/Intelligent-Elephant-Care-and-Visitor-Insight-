"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useState, useEffect } from "react";

export default function Home() {
  const { visitorId } = useAuth();

  const [status, setStatus] = useState<{ open: boolean; text: string }>({ open: false, text: "Loading..." });

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      // Operational hours: 8:30 AM - 5:30 PM
      const openTime = new Date(now); openTime.setHours(8, 30, 0);
      const closeTime = new Date(now); closeTime.setHours(17, 30, 0);

      if (now >= openTime && now < closeTime) {
        const diff = closeTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setStatus({ open: true, text: `Closing in ${hours}h ${minutes}m` });
      } else {
        setStatus({ open: false, text: "Opens at 8:30 AM" });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Update every min
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {/* SECTION 1: HERO */}
      <section className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_elephant_bathing_1767711958132.png" // Asset to be placed in public/
            alt="Majestic Elephants Bathing"
            fill
            className="object-cover brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-jungle-900/90 via-jungle-900/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-ivory drop-shadow-lg font-serif">
            Experience the Majesty <br /> of <span className="text-earth-500">Pinnawala</span>
          </h1>
          <p className="text-lg md:text-2xl text-earth-100/90 font-light max-w-2xl mx-auto">
            Witness the largest captive herd of wild Asian elephants in the world.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
            <Link
              href="/tickets"
              className="group bg-earth-500 hover:bg-earth-900 text-jungle-900 hover:text-earth-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-2 shadow-xl hover:scale-105"
            >
              Buy Tickets <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/timeline"
              className="bg-jungle-800/80 hover:bg-jungle-700/80 backdrop-blur-md text-ivory border border-earth-500/30 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              Today's Schedule <Calendar className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-earth-100/50">
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-current rounded-full animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* SECTION 2: AI HIGHLIGHT & INFO */}
      <section className="h-screen w-full snap-start bg-ivory text-jungle-900 flex items-center justify-center relative overflow-hidden">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold tracking-wide uppercase ${status.open ? 'bg-jungle-100 text-jungle-800' : 'bg-red-100 text-red-800'}`}>
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.open ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${status.open ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              Park {status.open ? 'Open' : 'Closed'} • {status.text}
            </div>

            <h2 className="text-4xl md:text-6xl font-serif font-bold text-jungle-900">
              Smart Insights <br /> for Your Visit
            </h2>
            <p className="text-xl text-jungle-900/70 leading-relaxed">
              Our AI-powered engine analyzes weather, crowd density, and elephant behavior to predict the perfect time for your visit.
            </p>

            {/* AI Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-earth-100 flex items-start gap-4">
              <div className="p-3 bg-earth-100 rounded-xl text-earth-900">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-jungle-900">
                  Best Time to Visit {new Date().getHours() >= 17 && new Date().getMinutes() >= 30 ? "Tomorrow" : "Today"}
                </h3>
                <p className="text-earth-900 font-medium text-2xl mt-1">
                  {new Date().getHours() >= 17 && new Date().getMinutes() >= 30 ? "09:15 AM" : "10:30 AM"}
                </p>
                <p className="text-sm text-gray-500 mt-2">Prediction: <span className="text-green-600 font-bold">Low Crowds</span> • {new Date().getHours() >= 17 && new Date().getMinutes() >= 30 ? "Bottle Feeding" : "River Bathing"}</p>
              </div>
            </div>
          </div>

          {/* Visual/Image Placeholder */}
          <div className="relative h-[500px] w-full bg-jungle-900 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 p-6 flex flex-col justify-center">
            <div className="absolute inset-0 bg-[url('/pattern-bg.png')] opacity-10"></div>

            {/* Decor */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <div className="text-xs font-bold text-red-500 uppercase tracking-widest">Live</div>
            </div>

            {/* Timeline Mock Items */}
            <div className="space-y-6 relative z-10 pl-4 border-l border-white/10 ml-4">
              {/* Item 1 */}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-earth-500 rounded-full ring-4 ring-jungle-900"></div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                  <h4 className="text-earth-500 font-bold text-sm uppercase mb-1">Observation • 10:00 AM</h4>
                  <h3 className="text-xl font-bold text-ivory">Herd Departure to River</h3>
                  <div className="mt-2 h-1 bg-white/10 rounded-full w-full overflow-hidden">
                    <div className="bg-emerald-500 w-[40%] h-full"></div>
                  </div>
                </div>
              </div>

              {/* Item 2 (Active) */}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-500 rounded-full ring-4 ring-jungle-900 animate-ping"></div>
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-500 rounded-full ring-4 ring-jungle-900"></div>
                <div className="bg-earth-500 p-4 rounded-xl border border-earth-400 shadow-lg transform scale-105">
                  <h4 className="text-jungle-900 font-bold text-sm uppercase mb-1">Interaction • 12:00 PM</h4>
                  <h3 className="text-xl font-bold text-jungle-900">River Bathing Session</h3>
                  <div className="flex justify-between text-xs font-bold text-jungle-900/60 mt-2">
                    <span>Crowd Level: High</span>
                    <span>92 Visitors</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-jungle-900/10 rounded-full w-full overflow-hidden">
                    <div className="bg-red-600 w-[85%] h-full"></div>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative opacity-50">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-white/20 rounded-full ring-4 ring-jungle-900"></div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h4 className="text-white/40 font-bold text-sm uppercase mb-1">Feeding • 14:00 PM</h4>
                  <h3 className="text-xl font-bold text-white/60">Fruit Feeding</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CTA / AUTH */}
      <section className="h-screen w-full snap-start bg-jungle-900 text-ivory flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('/pattern-bg.png')] opacity-5 mix-blend-overlay" />

        <div className="max-w-xl mx-auto text-center space-y-8 px-4 relative z-10">
          <User className="w-20 h-20 mx-auto text-earth-500" />
          <h2 className="text-4xl md:text-5xl font-bold font-serif">Start Your Journey</h2>
          <p className="text-xl text-earth-100/80">
            Create your profile to access smart ticketing, real-time event tracking, and your personalized visit history.
          </p>

          {visitorId ? (
            <Link href="/profile" className="w-full py-4 bg-earth-500 hover:bg-earth-400 text-jungle-900 font-bold rounded-xl text-center transition-colors shadow-lg flex items-center justify-center gap-2">
              Go to My Profile <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <Link href="/register" className="flex-1 py-4 bg-earth-500 hover:bg-earth-400 text-jungle-900 font-bold rounded-xl text-center transition-colors shadow-lg flex items-center justify-center">
                Create Account
              </Link>
              <Link href="/login" className="flex-1 py-4 bg-transparent border-2 border-earth-500 text-earth-500 hover:bg-earth-500/10 font-bold rounded-xl text-center transition-colors flex items-center justify-center">
                Log In
              </Link>
            </div>
          )}
        </div>

        <footer className="absolute bottom-4 w-full text-center text-sm text-jungle-100/30">
          © 2025 Pinnawala Elephant Orphanage • Department of National Zoological Gardens
        </footer>
      </section>
    </main>
  );
}
