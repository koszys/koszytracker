"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { GAME_CONFIG, GameConfig } from "@/config/games";

interface GameContextValue {
    activeGameId: string;
    setActiveGameId: (id: string) => void;
    activeGame: GameConfig;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
    const [activeGameId, setActiveGameIdState] = useState<string>(GAME_CONFIG[0].id);

    useEffect(() => {
        const stored = localStorage.getItem('senti_active_game');
        if (stored && GAME_CONFIG.some(g => g.id === stored)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveGameIdState(stored);
        } else {
            const defaultGame = GAME_CONFIG.find(g => g.status === 'active') || GAME_CONFIG[0];
            setActiveGameIdState(defaultGame.id);
        }
    }, []);

    const setActiveGameId = useCallback((id: string) => {
        setActiveGameIdState(id);
        localStorage.setItem('senti_active_game', id);
    }, []);

    const activeGame = GAME_CONFIG.find(g => g.id === activeGameId) || GAME_CONFIG[0];

    // Avoid returning early to allow context provider to render
    // with default values before hydration.
    return (
        <GameContext.Provider value={{ activeGameId, setActiveGameId, activeGame }}>
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
