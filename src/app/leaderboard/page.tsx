"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
  missionsCompleted: number;
}

interface Me {
  id: string;
  discordId: string;
  username: string;
}

const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

const RANK_BG: Record<number, string> = {
  1: "bg-yellow-400/5 border-yellow-400/20",
  2: "bg-gray-300/5 border-gray-300/20",
  3: "bg-amber-600/5 border-amber-600/20",
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/leaderboard?limit=50").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([lb, user]) => {
        setEntries(lb || []);
        setMe(user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Leaderboard
          </h1>
          <p className="text-muted text-sm">
            Top adventurers ranked by total XP earned.
          </p>
        </div>

        {/* Top 3 podium */}
        {!loading && entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            {[entries[1], entries[0], entries[2]].map((entry, i) => {
              const actualRank = [2, 1, 3][i];
              const isMe = me?.id === entry.id;
              const avatarUrl = entry.avatar
                ? `https://cdn.discordapp.com/avatars/${entry.discordId}/${entry.avatar}.png?size=128`
                : null;

              return (
                <div
                  key={entry.id}
                  className={`flex flex-col items-center p-4 sm:p-6 rounded-xl border transition-all duration-300
                    ${actualRank === 1 ? "bg-yellow-400/5 border-yellow-400/20 sm:-mt-4" : ""}
                    ${actualRank === 2 ? "bg-gray-300/5 border-gray-300/15" : ""}
                    ${actualRank === 3 ? "bg-amber-600/5 border-amber-600/15" : ""}
                    ${isMe ? "ring-1 ring-gold/40" : ""}
                  `}
                >
                  {/* Rank number */}
                  <span className={`font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold mb-3 ${RANK_STYLES[actualRank]}`}>
                    {actualRank}
                  </span>

                  {/* Avatar */}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 ring-2 ${
                        actualRank === 1 ? "ring-yellow-400/50" : actualRank === 2 ? "ring-gray-300/50" : "ring-amber-600/50"
                      }`}
                    />
                  ) : (
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 bg-surface-lighter flex items-center justify-center text-lg font-semibold ${RANK_STYLES[actualRank]}`}>
                      {entry.username[0].toUpperCase()}
                    </div>
                  )}

                  <p className={`text-sm font-semibold truncate max-w-full ${isMe ? "text-gold" : "text-foreground"}`}>
                    {entry.username}
                  </p>
                  <p className="text-gold text-xs font-medium mt-1">
                    {entry.xp.toLocaleString()} XP
                  </p>
                  <p className="text-muted text-[10px] mt-0.5">
                    Lv. {entry.level}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-14 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <p className="text-muted">No players on the leaderboard yet.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[3rem_1fr_5rem_5rem_5rem] sm:grid-cols-[4rem_1fr_6rem_6rem_7rem] gap-2 px-4 py-3 border-b border-border text-xs text-muted uppercase tracking-wider">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Level</span>
              <span className="text-right">XP</span>
              <span className="text-right hidden sm:block">Missions</span>
            </div>

            {/* Rows */}
            {entries.map((entry) => {
              const isMe = me?.id === entry.id;
              const isTop3 = entry.rank <= 3;
              const avatarUrl = entry.avatar
                ? `https://cdn.discordapp.com/avatars/${entry.discordId}/${entry.avatar}.png?size=64`
                : null;

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-[3rem_1fr_5rem_5rem_5rem] sm:grid-cols-[4rem_1fr_6rem_6rem_7rem] gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0 transition-colors
                    ${isMe ? "bg-gold/5" : "hover:bg-surface-light/50"}
                    ${isTop3 ? RANK_BG[entry.rank] || "" : ""}
                  `}
                >
                  <span className={`font-[family-name:var(--font-cinzel)] font-bold text-sm ${RANK_STYLES[entry.rank] || "text-muted"}`}>
                    {entry.rank}
                  </span>
                  <div className="flex items-center gap-2.5 min-w-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-surface-lighter shrink-0 flex items-center justify-center text-xs text-muted">
                        {entry.username[0].toUpperCase()}
                      </div>
                    )}
                    <span className={`text-sm truncate ${isMe ? "text-gold font-semibold" : "text-foreground"}`}>
                      {entry.username}
                      {isMe && <span className="text-gold/60 text-xs ml-1.5">(you)</span>}
                    </span>
                  </div>
                  <span className="text-sm text-foreground text-right">{entry.level}</span>
                  <span className="text-sm text-gold text-right font-medium">
                    {entry.xp >= 1000 ? `${(entry.xp / 1000).toFixed(1)}k` : entry.xp}
                  </span>
                  <span className="text-sm text-muted text-right hidden sm:block">
                    {entry.missionsCompleted}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
