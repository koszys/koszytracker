"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface WishData {
    id: string;
    name: string;
    rarity: number;
    gacha_type: number;
    time: string;
}

interface UseWishesResult {
    wishes: WishData[];
    loading: boolean;
    error: string | null;
}

export function useWishes(gameId: string, accountId: string | undefined): UseWishesResult {
    const { user, getToken } = useAuth();
    const [wishes, setWishes] = useState<WishData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        async function fetchData() {
            try {
                if (user) {
                    // Authenticated: fetch from API
                    const token = getToken();
                    const accountNum = accountId?.replace("db_", "");
                    if (!accountNum) {
                        if (!cancelled) { setWishes([]); setLoading(false); }
                        return;
                    }

                    const res = await fetch(
                        `http://localhost:8000/api/wishes/${accountNum}`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (!res.ok) throw new Error("Failed to fetch wishes");
                    const data = await res.json();

                    // Normalize API shape -> WishData[]
                    const normalized: WishData[] = data.wishes.map((w: any) => ({
                        id: w.wish_uid,
                        name: w.item_name,
                        rarity: w.rarity,
                        gacha_type: w.gacha_type,
                        time: w.timestamp,
                    }));

                    if (!cancelled) setWishes(normalized);
                } else {
                    // Not authenticated: read from localStorage
                    const stored = localStorage.getItem(`wishes-${gameId}`);
                    const parsed: WishData[] = stored ? JSON.parse(stored) : [];

                    // Reverse so newest-first (import appends, so last is newest)
                    if (!cancelled) setWishes(parsed.reverse());
                }
            } catch (e: any) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, [gameId, accountId, user, getToken]);

    return { wishes, loading, error };
}