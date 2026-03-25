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
  1: "text-gold",
  2: "text-gold-light",
  3: "text-gold-dark",
};

const RANK_BG: Record<number, string> = {
  1: "bg-gold/5 border-gold/20",
  2: "bg-gold/3 border-gold-light/15",
  3: "bg-gold/3 border-gold-dark/15",
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
            Top Knights ranked by total XP earned in the devastated lands.
          </p>
        </div>

        {/* Top 3 podium */}
        {!loading && entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
            {[entries[1], entries[0], entries[2]].map((entry, i) => {
              const actualRank = [2, 1, 3][i];
              const isMe = me?.id === entry.id;
              const avatarUrl = entry.avatar
                ? `https://cdn.discordapp.com/avatars/${entry.discordId}/${entry.avatar}.png?size=128`
                : null;

              return (
                <div
                  key={entry.id}
                  className={`flex flex-col items-center p-2 sm:p-4 lg:p-6 rounded-xl border transition-all duration-300
                    ${actualRank === 1 ? "glass-card border-gold/30 sm:-mt-4 shadow-[0_0_25px_rgba(0,255,102,0.1)]" : ""}
                    ${actualRank === 2 ? "glass-card border-gold/15" : ""}
                    ${actualRank === 3 ? "glass-card border-gold/10" : ""}
                    ${isMe ? "ring-1 ring-gold/40" : ""}
                  `}
                >
                  {/* Rank number */}
                  <span className={`font-[family-name:var(--font-cinzel)] text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 ${RANK_STYLES[actualRank]} ${actualRank === 1 ? "drop-shadow-[0_0_10px_rgba(0,255,102,0.4)]" : ""}`}>
                    {actualRank}
                  </span>

                  {/* Avatar */}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className={`w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full mb-2 sm:mb-3 ring-2 ${
                        actualRank === 1 ? "ring-gold/50 shadow-[0_0_15px_rgba(0,255,102,0.2)]" : actualRank === 2 ? "ring-gold-light/40" : "ring-gold-dark/40"
                      }`}
                    />
                  ) : (
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full mb-2 sm:mb-3 bg-surface-lighter flex items-center justify-center text-base sm:text-lg font-semibold ${RANK_STYLES[actualRank]}`}>
                      {entry.username[0].toUpperCase()}
                    </div>
                  )}

                  <p className={`text-xs sm:text-sm font-semibold truncate max-w-full ${isMe ? "text-gold" : "text-foreground"}`}>
                    {entry.username}
                  </p>
                  <p className="text-gold text-[10px] sm:text-xs font-medium mt-1">
                    {entry.xp >= 1000 ? `${(entry.xp / 1000).toFixed(1)}k` : entry.xp} XP
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
          <div className="glass-card rounded-xl p-8 sm:p-12 text-center">
            <p className="text-muted">No Knights on the leaderboard yet.</p>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
            {/* Table header */}
            <div className="grid grid-cols-[2.5rem_1fr_4rem_4.5rem] sm:grid-cols-[4rem_1fr_6rem_6rem_7rem] gap-2 px-4 py-3 border-b border-border text-xs text-muted uppercase tracking-wider min-w-0">
              <span>Rank</span>
              <span>Knight</span>
              <span className="text-right">Lvl</span>
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
                  className={`grid grid-cols-[2.5rem_1fr_4rem_4.5rem] sm:grid-cols-[4rem_1fr_6rem_6rem_7rem] gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0 transition-colors
                    ${isMe ? "bg-gold/5" : "hover:bg-surface-light/50"}
                    ${isTop3 ? RANK_BG[entry.rank] || "" : ""}
                  `}
                >
                  <span className={`font-[family-name:var(--font-cinzel)] font-bold text-sm ${RANK_STYLES[entry.rank] || "text-muted"}`}>
                    {entry.rank}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-surface-lighter shrink-0 flex items-center justify-center text-xs text-muted">
                        {entry.username[0].toUpperCase()}
                      </div>
                    )}
                    <span className={`text-sm truncate ${isMe ? "text-gold font-semibold" : "text-foreground"}`}>
                      {entry.username}
                      {isMe && <span className="text-gold/60 text-xs ml-1">(you)</span>}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-foreground text-right">{entry.level}</span>
                  <span className="text-xs sm:text-sm text-gold text-right font-medium">
                    {entry.xp >= 1000 ? `${(entry.xp / 1000).toFixed(1)}k` : entry.xp}
                  </span>
                  <span className="text-sm text-muted text-right hidden sm:block">
                    {entry.missionsCompleted}
                  </span>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
