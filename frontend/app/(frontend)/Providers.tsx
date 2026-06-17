"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";

export function Providers({ children, isDraftMode = false }: { children: React.ReactNode; isDraftMode?: boolean }) {
  return (
    <AuthProvider>
      <GameProvider isDraftMode={isDraftMode}>
        {children}
      </GameProvider>
    </AuthProvider>
  );
}