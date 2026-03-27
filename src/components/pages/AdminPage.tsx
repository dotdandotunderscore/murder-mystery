import { useState } from "react";
import { PlayersPanel } from "../admin/PlayersPanel";
import { PagesPanel } from "../admin/PagesPanel";

// ── Admin Page ─────────────────────────────────────────────────────────────────

const TABS = ["players", "pages"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("players");

  return (
    <div className="animate-fade-in">
      <h2
        className="text-2xl text-cream mb-6"
        style={{ fontFamily: "var(--font-family-display)" }}
      >
        Admin Panel
      </h2>

      {/* Tabs */}
      <div className="border-b border-gold/20 mb-6 flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-5 py-3 text-xs tracking-[0.3em] uppercase transition-colors capitalize ${
              activeTab === tab
                ? "text-gold border-b-2 border-gold -mb-px"
                : "text-muted hover:text-cream"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[55vh]">
        {activeTab === "players" && <PlayersPanel />}
        {activeTab === "pages" && <PagesPanel />}
      </div>
    </div>
  );
}
