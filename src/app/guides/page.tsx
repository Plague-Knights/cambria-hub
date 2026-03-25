"use client";

import { useEffect, useState } from "react";

interface Guide {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  "getting-started": {
    label: "Getting Started",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "text-gold bg-gold/10",
  },
  combat: {
    label: "Combat",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: "text-gold bg-gold/10",
  },
  gathering: {
    label: "Gathering",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
    color: "text-gold-light bg-gold/10",
  },
  trading: {
    label: "Trading",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z",
    color: "text-gold bg-gold/10",
  },
  crafting: {
    label: "Crafting",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    color: "text-gold-light bg-gold/10",
  },
  general: {
    label: "General",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    color: "text-gold bg-gold/10",
  },
};

function getCategoryMeta(category: string) {
  return CATEGORY_META[category] || CATEGORY_META.general;
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    fetch("/api/guides")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setGuides(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(guides.map((g) => g.category)))];
  const filtered = activeCategory === "all" ? guides : guides.filter((g) => g.category === activeCategory);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Guides
          </h1>
          <p className="text-muted text-sm">
            Everything you need to survive the devastated lands of Cambria.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const meta = cat === "all" ? { label: "All" } : getCategoryMeta(cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 border
                  ${
                    activeCategory === cat
                      ? "bg-gold/10 text-gold border-gold/30 shadow-[0_0_10px_rgba(0,255,102,0.1)]"
                      : "bg-surface text-muted border-border hover:text-foreground hover:border-gold/15"
                  }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Guides Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted">No guides available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((guide) => {
              const meta = getCategoryMeta(guide.category);
              const preview = guide.content
                .replace(/[#*_`>\[\]()!-]/g, "")
                .slice(0, 120)
                .trim();

              return (
                <div
                  key={guide.id}
                  className="glass-card rounded-xl p-5 transition-all duration-200 group flex flex-col"
                >
                  {/* Category icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.color}`}>
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={meta.icon} />
                      </svg>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-lighter text-muted border border-border uppercase tracking-wider">
                      {meta.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-[family-name:var(--font-cinzel)] text-foreground font-semibold text-sm mb-2 group-hover:text-gold transition-colors">
                    {guide.title}
                  </h3>

                  {/* Preview */}
                  <p className="text-muted text-xs leading-relaxed flex-1 line-clamp-3">
                    {preview}...
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted">
                      Updated {new Date(guide.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-gold text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                      Read
                      <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
