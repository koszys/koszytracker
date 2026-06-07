"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </AuthProvider>
  );
}