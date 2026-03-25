"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) setLoggedIn(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-gold bg-gold/5 text-gold text-xs font-medium tracking-wider uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Now Live
          </div>

          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="animate-shimmer">Cambria</span>
            <br />
            <span className="text-foreground">Mission Hub</span>
          </h1>

          <p className="text-muted text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-10">
            Complete missions, earn XP, and rise through the ranks.
            Your journey in Cambria starts here.
          </p>

          {!checking && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {loggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gold hover:bg-gold-light text-background font-semibold text-sm tracking-wide transition-all duration-200 hover:shadow-[0_0_24px_rgba(212,168,50,0.3)]"
                >
                  Enter Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <a
                  href="/api/auth/discord"
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold text-sm tracking-wide transition-all duration-200 hover:shadow-[0_0_24px_rgba(88,101,242,0.3)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                  </svg>
                  Login with Discord
                </a>
              )}
              <Link
                href="/missions"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-border hover:border-gold/40 text-foreground text-sm font-medium transition-all duration-200"
              >
                Browse Missions
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              title: "Complete Missions",
              desc: "Daily, weekly, and seasonal missions tailored to your Cambria adventure.",
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
            },
            {
              title: "Earn XP & Level Up",
              desc: "Gain experience for every mission completed. Rise through the ranks.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
            },
            {
              title: "Climb the Leaderboard",
              desc: "Compete with other players and prove your worth on the global leaderboard.",
              icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="group p-6 rounded-xl bg-surface border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,168,50,0.06)]"
            >
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/15 transition-colors">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feat.icon} />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-cinzel)] text-foreground font-semibold mb-2">
                {feat.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
