"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

interface TimerContextValue {
    getTimeLeft: (endDate: string | Date) => number;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const getTimeLeft = useCallback((endDate: string | Date) => {
        return Math.max(0, new Date(endDate).getTime() - Date.now());
    }, []);

    return (
        <TimerContext.Provider value={{ getTimeLeft }}>
            {children}
        </TimerContext.Provider>
    );
}

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error("useTimer must be used within a TimerProvider");
    }
    return context;
};
