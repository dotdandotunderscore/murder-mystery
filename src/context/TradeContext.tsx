import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { usePlayer } from "./PlayerContext";

export interface Trade {
  id: number;
  initiator_id: number;
  initiator_name: string;
  initiator_word: string;
  recipient_id: number;
  recipient_name: string;
  recipient_word: string | null;
  status: "offered" | "countered" | "accepted" | "cancelled";
  created_at: string;
  expires_at: string;
}

export interface TradePlayer {
  id: number;
  name: string;
  role: string | null;
  team: string | null;
}

interface TradeContextValue {
  trades: Trade[];
  players: TradePlayer[];
  inventory: string[];
  flags: string[];
  refreshInventory: () => void;
  refreshFlags: () => void;
  pendingActionCount: number;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  offerWord: string | null;
  setOfferWord: (word: string | null) => void;
  createOffer: (word: string, recipientId: number) => Promise<boolean>;
  counterOffer: (tradeId: number, word: string) => Promise<boolean>;
  acceptOffer: (tradeId: number) => Promise<{ ok: boolean; error?: string }>;
  cancelOffer: (tradeId: number) => Promise<boolean>;
  refresh: () => void;
}

const TradeContext = createContext<TradeContextValue | null>(null);

export function useTradeContext() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error("useTradeContext must be inside TradeProvider");
  return ctx;
}

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const { player } = usePlayer();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [players, setPlayers] = useState<TradePlayer[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [offerWord, setOfferWord] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchTrades = useCallback(async () => {
    const res = await fetch("/api/trades");
    if (res.ok) setTrades(await res.json());
  }, []);

  const fetchPlayers = useCallback(async () => {
    const res = await fetch("/api/players");
    if (res.ok) setPlayers(await res.json());
  }, []);

  const refreshInventory = useCallback(async () => {
    const res = await fetch("/api/inventory");
    if (res.ok) setInventory(await res.json());
  }, []);

  const refreshFlags = useCallback(async () => {
    const res = await fetch("/api/flags");
    if (res.ok) setFlags(await res.json());
  }, []);

  useEffect(() => {
    if (!player) return;

    fetchTrades();
    fetchPlayers();
    refreshInventory();
    refreshFlags();

    let dead = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (dead) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data) as
          | { type: "trade_update"; trade: Trade }
          | { type: "trade_removed"; tradeId: number }
          | { type: "player_updated" }
          | { type: "dirt_received"; rumour: string; from_name: string }
          | { type: "leaderboard_updated" };

        if (msg.type === "trade_update") {
          setTrades((prev) => {
            const idx = prev.findIndex((t) => t.id === msg.trade.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = msg.trade;
              return next;
            }
            return [msg.trade, ...prev];
          });
          if (msg.trade.status === "accepted") {
            refreshInventory();
          }
        } else if (msg.type === "trade_removed") {
          setTrades((prev) => prev.filter((t) => t.id !== msg.tradeId));
        } else if (msg.type === "player_updated") {
          refreshInventory();
          refreshFlags();
        } else if (msg.type === "dirt_received") {
          // Dirt landed on this player — no action needed, the RumoursSection will refresh on panel open
        } else if (msg.type === "leaderboard_updated") {
          // Leaderboard changed — components with leaderboard views will poll or re-fetch
        }
      };

      ws.onerror = () => {};
      ws.onclose = () => {
        wsRef.current = null;
        if (!dead) {
          // Re-fetch trades in case we missed pushes while disconnected,
          // then reconnect after a short delay.
          fetchTrades();
          retryTimer = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      dead = true;
      if (retryTimer) clearTimeout(retryTimer);
      wsRef.current?.close();
    };
  }, [player?.id]);

  const pendingActionCount = trades.filter((t) => {
    if (!player) return false;
    return (
      (t.status === "offered" && t.recipient_id === player.id) ||
      (t.status === "countered" && t.initiator_id === player.id)
    );
  }).length;

  const createOffer = async (word: string, recipientId: number): Promise<boolean> => {
    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, recipient_id: recipientId }),
    });
    if (res.ok) {
      const trade: Trade = await res.json();
      setTrades((prev) => [trade, ...prev]);
      return true;
    }
    return false;
  };

  const counterOffer = async (tradeId: number, word: string): Promise<boolean> => {
    const res = await fetch(`/api/trades/${tradeId}/counter`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    });
    if (res.ok) {
      const trade: Trade = await res.json();
      setTrades((prev) => prev.map((t) => (t.id === tradeId ? trade : t)));
      return true;
    }
    return false;
  };

  const acceptOffer = async (tradeId: number): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch(`/api/trades/${tradeId}/accept`, { method: "POST" });
    if (res.ok) {
      setTrades((prev) => prev.filter((t) => t.id !== tradeId));
      refreshInventory(); // words changed hands
      return { ok: true };
    }
    const data = await res.json().catch(() => ({})) as { error?: string };
    return { ok: false, error: data.error };
  };

  const cancelOffer = async (tradeId: number): Promise<boolean> => {
    const res = await fetch(`/api/trades/${tradeId}`, { method: "DELETE" });
    if (res.ok) {
      setTrades((prev) => prev.filter((t) => t.id !== tradeId));
      return true;
    }
    return false;
  };

  return (
    <TradeContext.Provider
      value={{
        trades,
        players,
        inventory,
        flags,
        refreshInventory,
        refreshFlags,
        pendingActionCount,
        panelOpen,
        setPanelOpen,
        offerWord,
        setOfferWord,
        createOffer,
        counterOffer,
        acceptOffer,
        cancelOffer,
        refresh: fetchTrades,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}
