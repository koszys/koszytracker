"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { GAME_CONFIG, GameConfig } from "@/config/games";

interface GameContextValue {
    activeGameId: string;
    setActiveGameId: (id: string) => void;
    activeGame: GameConfig;
    recentGameIds: string[];
    isDraftMode: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children, isDraftMode = false }: { children: ReactNode; isDraftMode?: boolean }) {
    const [activeGameId, setActiveGameIdState] = useState<string>(GAME_CONFIG[0].id);
    const [recentGameIds, setRecentGameIds] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('senti_active_game');
        if (stored && GAME_CONFIG.some(g => g.id === stored)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveGameIdState(stored);
        }
        const recentStored = localStorage.getItem('senti-recent-games');
        if (recentStored) {
            try {
                const parsed: string[] = JSON.parse(recentStored);
                const valid = parsed.filter(id => GAME_CONFIG.some(g => g.id === id));
                if (valid.length > 0) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setRecentGameIds(valid);
                }
            } catch {
                // ignore invalid JSON
            }
        }
    }, []);

    const setActiveGameId = useCallback((id: string) => {
        setActiveGameIdState(id);
        localStorage.setItem('senti_active_game', id);
        setRecentGameIds(prev => {
            const updated = [id, ...prev.filter(pid => pid !== id)].slice(0, 3);
            localStorage.setItem('senti-recent-games', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const activeGame = GAME_CONFIG.find(g => g.id === activeGameId) || GAME_CONFIG[0];

    // Avoid returning early to allow context provider to render
    // with default values before hydration.
    return (
        <GameContext.Provider value={{ activeGameId, setActiveGameId, activeGame, recentGameIds, isDraftMode }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
