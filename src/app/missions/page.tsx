"use client";

import { useEffect, useState } from "react";

interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  xpReward: number;
  icon: string | null;
  isActive: boolean;
  prerequisiteId: string | null;
  prerequisite?: { id: string; title: string } | null;
  startsAt: string | null;
  endsAt: string | null;
  season: { id: string; name: string } | null;
  _count: { completions: number };
}

const TABS = ["All", "CORE", "DAILY", "WEEKLY", "SEASONAL", "SPECIAL"] as const;

function typeColor(type: string) {
  switch (type) {
    case "CORE": return "bg-gold/15 text-gold border-gold/20";
    case "DAILY": return "bg-gold/10 text-gold-light border-gold/15";
    case "WEEKLY": return "bg-gold/15 text-gold border-gold/20";
    case "SEASONAL": return "bg-gold/20 text-gold border-gold/25";
    case "SPECIAL": return "bg-gold/25 text-gold border-gold/30";
    default: return "bg-surface-lighter text-muted border-border";
  }
}

function categoryLabel(cat: string) {
  return cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch("/api/missions").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([miss, prof]) => {
        setMissions(miss || []);
        if (prof?.recentCompletions) {
          setCompletedIds(
            new Set(prof.recentCompletions.map((c: { id: string; missionId?: string; mission?: { title: string } }) => c.missionId || c.id))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === "All" ? missions : missions.filter((m) => m.type === activeTab);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Missions
          </h1>
          <p className="text-muted text-sm">
            Complete missions to earn XP and rise through the ranks, Knight.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 border
                ${
                  activeTab === tab
                    ? "bg-gold/10 text-gold border-gold/30 shadow-[0_0_10px_rgba(0,255,102,0.1)]"
                    : "bg-surface text-muted border-border hover:text-foreground hover:border-gold/15"
                }`}
            >
              {tab === "All" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Mission Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted">No missions found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((mission) => {
              const isCompleted = completedIds.has(mission.id);
              const isLocked = mission.prerequisiteId && !completedIds.has(mission.prerequisiteId);
              const isInactive = !mission.isActive;

              return (
                <div
                  key={mission.id}
                  className={`relative rounded-xl p-5 transition-all duration-200 group
                    ${isCompleted ? "glass-card border-gold/30 bg-gold/5" : ""}
                    ${isLocked ? "glass-card opacity-60" : ""}
                    ${!isCompleted && !isLocked ? "glass-card" : ""}
                  `}
                >
                  {/* Status indicator */}
                  {isCompleted && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 rounded-full bg-surface-lighter flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Type & Category */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border ${typeColor(mission.type)}`}>
                      {mission.type}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-lighter text-muted border border-border">
                      {categoryLabel(mission.category)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`font-[family-name:var(--font-cinzel)] font-semibold text-sm mb-1.5 transition-colors
                    ${isCompleted ? "text-gold" : isLocked ? "text-muted" : "text-foreground group-hover:text-gold"}`}
                  >
                    {mission.icon && <span className="mr-1.5">{mission.icon}</span>}
                    {mission.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted text-xs leading-relaxed line-clamp-2 mb-4">
                    {mission.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-gold text-sm font-semibold">+{mission.xpReward} XP</span>
                    {isCompleted && <span className="text-gold text-xs font-medium">Completed</span>}
                    {isLocked && <span className="text-muted text-xs">Requires prerequisite</span>}
                    {isInactive && !isCompleted && !isLocked && (
                      <span className="text-muted text-xs">Inactive</span>
                    )}
                    {!isCompleted && !isLocked && mission.isActive && (
                      <span className="text-muted text-xs">{mission._count.completions} completed</span>
                    )}
                  </div>

                  {/* Time remaining */}
                  {mission.endsAt && mission.isActive && !isCompleted && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ends {new Date(mission.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  )}

                  {/* Season tag */}
                  {mission.season && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-gold flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        {mission.season.name}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
