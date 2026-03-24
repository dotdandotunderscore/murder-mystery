import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Player {
  id: number;
  name: string;
  role: string | null;
  team: string | null;
  is_admin: boolean;
  created_at: string;
}

interface PlayerContextValue {
  player: Player | null;
  loading: boolean;
  setPlayer: (player: Player | null) => void;
  logout: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue>({
  player: null,
  loading: true,
  setPlayer: () => {},
  logout: async () => {},
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPlayer(data))
      .catch(() => setPlayer(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setPlayer(null);
  }, []);

  return (
    <PlayerContext.Provider value={{ player, loading, setPlayer, logout }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
