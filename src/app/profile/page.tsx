"use client";

import { useEffect, useState } from "react";

interface Profile {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
  walletAddress?: string | null;
  xp: number;
  level: number;
  missionsCompleted: number;
  recentCompletions: {
    id: string;
    completedAt: string;
    mission: {
      title: string;
      xpReward: number;
      type: string;
      icon: string | null;
    };
  }[];
}

function xpForLevel(level: number) {
  return (level - 1) * 1000;
}

function xpToNextLevel(xp: number, level: number) {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return {
    current: xp - currentLevelXp,
    needed: nextLevelXp - currentLevelXp,
    percent: Math.min(100, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100),
  };
}

function typeColor(type: string) {
  switch (type) {
    case "CORE": return "text-blue-400";
    case "DAILY": return "text-green-400";
    case "WEEKLY": return "text-purple-400";
    case "SEASONAL": return "text-orange-400";
    case "SPECIAL": return "text-gold";
    default: return "text-muted";
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (r.status === 401) {
          setAuthed(false);
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((data) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-surface animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-surface rounded animate-pulse" />
              <div className="h-4 w-24 bg-surface rounded animate-pulse" />
            </div>
          </div>
          <div className="h-24 bg-surface rounded-xl animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!authed || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="font-[family-name:var(--font-cinzel)] text-xl font-semibold text-foreground mb-2">
          Login Required
        </h2>
        <p className="text-muted text-sm mb-6">Connect your Discord account to view your profile.</p>
        <a
          href="/api/auth/discord"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white font-medium text-sm transition-colors"
        >
          Login with Discord
        </a>
      </div>
    );
  }

  const xpProgress = xpToNextLevel(profile.xp, profile.level);
  const avatarUrl = profile.avatar
    ? `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png?size=256`
    : null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
      <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
        {/* Profile Header */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-24 h-24 rounded-full ring-2 ring-gold/30 shadow-[0_0_30px_rgba(212,168,50,0.1)]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-surface-lighter flex items-center justify-center text-3xl font-bold text-gold ring-2 ring-gold/30">
                {profile.username[0].toUpperCase()}
              </div>
            )}

            <div className="text-center sm:text-left flex-1">
              <h1 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold text-foreground">
                {profile.username}
              </h1>
              <p className="text-gold text-sm font-medium mt-1">
                Level {profile.level} Adventurer
              </p>

              {/* XP Progress */}
              <div className="mt-4 max-w-md">
                <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                  <span>Progress to Level {profile.level + 1}</span>
                  <span className="text-gold">{xpProgress.current} / {xpProgress.needed} XP</span>
                </div>
                <div className="h-2.5 bg-surface-lighter rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full transition-all duration-700"
                    style={{ width: `${xpProgress.percent}%` }}
                  />
                </div>
              </div>

              {/* Wallet */}
              {profile.walletAddress && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-lighter border border-border text-xs text-muted">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total XP", value: profile.xp.toLocaleString(), accent: "text-gold" },
            { label: "Level", value: profile.level.toString(), accent: "text-gold" },
            { label: "Missions", value: profile.missionsCompleted.toString(), accent: "text-green-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-4 sm:p-5 text-center hover:border-gold/20 transition-colors"
            >
              <p className={`font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold ${stat.accent}`}>
                {stat.value}
              </p>
              <p className="text-muted text-xs mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Completion History */}
        <div>
          <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground mb-4">
            Mission History
          </h2>
          {profile.recentCompletions.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-muted text-sm">No missions completed yet. Start your adventure!</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl divide-y divide-border">
              {profile.recentCompletions.map((comp) => (
                <div key={comp.id} className="flex items-center justify-between px-5 py-4 hover:bg-surface-light/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">
                        {comp.mission.icon && <span className="mr-1">{comp.mission.icon}</span>}
                        {comp.mission.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] uppercase tracking-wider font-medium ${typeColor(comp.mission.type)}`}>
                          {comp.mission.type}
                        </span>
                        <span className="text-[10px] text-muted">
                          {new Date(comp.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-gold text-sm font-semibold shrink-0 ml-4">
                    +{comp.mission.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
