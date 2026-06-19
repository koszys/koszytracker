"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import { ToastProvider } from "@/contexts/ToastContext";
import GlobalRealtimeListener from "@/contexts/GlobalRealtimeListener";

export function Providers({ children, isDraftMode = false }: { children: React.ReactNode; isDraftMode?: boolean }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <GameProvider isDraftMode={isDraftMode}>
          {children}
          <GlobalRealtimeListener />
        </GameProvider>
      </AuthProvider>
    </ToastProvider>
  );
}