"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
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

interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  xpReward: number;
  icon: string | null;
  isActive: boolean;
  endsAt: string | null;
  _count: { completions: number };
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

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => {
        if (r.status === 401) {
          setAuthed(false);
          return null;
        }
        return r.ok ? r.json() : null;
      }),
      fetch("/api/missions?active=true").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([prof, miss]) => {
        setProfile(prof);
        setMissions(miss || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (!authed || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="font-[family-name:var(--font-cinzel)] text-xl font-semibold text-foreground mb-2">
          Login Required
        </h2>
        <p className="text-muted text-sm mb-6">Connect your Discord account to access the dashboard.</p>
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
    ? `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png?size=128`
    : null;

  const activeMissions = missions.filter((m) => m.isActive).slice(0, 6);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Welcome */}
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-14 h-14 rounded-full ring-2 ring-gold/30" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-surface-lighter flex items-center justify-center text-xl text-gold font-semibold">
              {profile.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold text-foreground">
              Welcome back, <span className="text-gold">{profile.username}</span>
            </h1>
            <p className="text-muted text-sm mt-0.5">
              Level {profile.level} Adventurer
            </p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted">Level {profile.level}</span>
            <span className="text-sm text-gold font-medium">
              {xpProgress.current.toLocaleString()} / {xpProgress.needed.toLocaleString()} XP
            </span>
            <span className="text-sm text-muted">Level {profile.level + 1}</span>
          </div>
          <div className="h-3 bg-surface-lighter rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full transition-all duration-700 ease-out"
              style={{ width: `${xpProgress.percent}%` }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total XP", value: profile.xp.toLocaleString(), icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { label: "Level", value: profile.level.toString(), icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
            { label: "Missions Done", value: profile.missionsCompleted.toString(), icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Rank", value: "#--", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-5 hover:border-gold/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
                <span className="text-xs text-muted uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="font-[family-name:var(--font-cinzel)] text-2xl font-bold text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Active Missions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground">
              Active Missions
            </h2>
            <Link href="/missions" className="text-gold text-sm hover:text-gold-light transition-colors">
              View All
            </Link>
          </div>
          {activeMissions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-surface border border-border rounded-xl p-5 hover:border-gold/20 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${typeColor(mission.type)}`}>
                      {mission.type}
                    </span>
                    <span className="text-gold text-sm font-semibold">+{mission.xpReward} XP</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-cinzel)] text-foreground font-semibold text-sm mb-1.5 group-hover:text-gold transition-colors">
                    {mission.title}
                  </h3>
                  <p className="text-muted text-xs leading-relaxed line-clamp-2">
                    {mission.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-muted text-sm">No active missions right now. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Recent Completions */}
        {profile.recentCompletions.length > 0 && (
          <div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold text-foreground mb-4">
              Recent Completions
            </h2>
            <div className="bg-surface border border-border rounded-xl divide-y divide-border">
              {profile.recentCompletions.map((comp) => (
                <div key={comp.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">{comp.mission.title}</p>
                      <p className="text-xs text-muted">
                        {new Date(comp.completedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-gold text-sm font-medium">+{comp.mission.xpReward} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function typeColor(type: string) {
  switch (type) {
    case "CORE": return "bg-blue-500/15 text-blue-400";
    case "DAILY": return "bg-green-500/15 text-green-400";
    case "WEEKLY": return "bg-purple-500/15 text-purple-400";
    case "SEASONAL": return "bg-orange-500/15 text-orange-400";
    case "SPECIAL": return "bg-gold/15 text-gold";
    default: return "bg-surface-lighter text-muted";
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-surface rounded animate-pulse" />
            <div className="h-4 w-24 bg-surface rounded animate-pulse" />
          </div>
        </div>
        <div className="h-20 bg-surface rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
