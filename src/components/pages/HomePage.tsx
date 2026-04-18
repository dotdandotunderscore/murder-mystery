import React, { useState, useEffect } from "react";

interface VisitedPage {
  code_phrase: string;
  claimed_at: string;
}

export default function HomePage() {
  const [history, setHistory] = useState<VisitedPage[]>([]);

  useEffect(() => {
    fetch("/api/pages/history")
      .then((r) => r.json())
      .then((data) => setHistory(data))
      .catch(() => {});
  }, []);

  return (
    <div className="text-center py-6">

      {history.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gold/20" />
            <span className="text-muted text-xs tracking-[0.25em] uppercase">
              Visited Pages
            </span>
            <div className="flex-1 h-px bg-gold/20" />
          </div>
          <ul className="space-y-1.5">
            {history.map((page, i) => (
              <li key={i} className="text-cream/50 text-sm">
                {page.code_phrase}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
