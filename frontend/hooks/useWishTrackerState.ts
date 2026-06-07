"use client";

import { useState, useMemo, useRef } from "react";
import { GameConfig, BannerConfig, RarityTier } from "@/config/games";
import { WishData } from "@/hooks/useWishes";
import { BannerStats, computeBannerStats, computeWishPity } from "@/utils/stats";
import { getBannerId } from "@/utils/gachaTypes";
import { formatWishTime } from "@/utils/formatters";

export interface UseWishTrackerStateReturn {
    activeBanner: BannerConfig;
    setActiveBanner: (banner: BannerConfig) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeRarities: Set<number>;
    toggleRarity: (rarity: number) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    rowsPerPage: number;
    setRowsPerPage: (perPage: number) => void;
    recentPage: number;
    setRecentPage: (page: number) => void;
    recentPerPage: number;
    setRecentPerPage: (perPage: number) => void;
    recentRarities: Set<number>;
    toggleRecentRarity: (rarity: number) => void;
    topRarities: RarityTier[];
    bannerStats: Record<string, BannerStats>;
    currentStats: BannerStats;
    rarityCounts: Record<number, number>;
    pullNumberMap: Map<string, number>;
    recentPityData: (WishData & { pity: number })[];
    recentPaginated: (WishData & { pity: number })[];
    filtered: (WishData & { pity: number })[];
    paginated: (WishData & { pity: number })[];
    totalPages: number;
    lowestRarity: number;
}

export function useWishTrackerState(game: GameConfig, wishes: WishData[]): UseWishTrackerStateReturn {
    const [activeBanner, setActiveBanner] = useState<BannerConfig>(game.banners[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeRarities, setActiveRarities] = useState<Set<number>>(
        new Set(game.rarityTiers.map(t => t.value))
    );
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [recentPage, setRecentPage] = useState(1);
    const [recentPerPage, setRecentPerPage] = useState(20);

    const topRarities = useMemo(() => {
        const sorted = [...game.rarityTiers].sort((a, b) => b.value - a.value);
        return sorted.slice(0, 2);
    }, [game]);

    const [recentRarities, setRecentRarities] = useState<Set<number>>(
        new Set(topRarities.map(t => t.value))
    );

    const prevGameId = useRef(game.id);

    if (game.id !== prevGameId.current) {
        prevGameId.current = game.id;
        setActiveBanner(game.banners[0]);
        setActiveRarities(new Set(game.rarityTiers.map(t => t.value)));
        setCurrentPage(1);
        setRecentPage(1);

        const sorted = [...game.rarityTiers].sort((a, b) => b.value - a.value);
        const top = sorted.slice(0, 2);
        setRecentRarities(new Set(top.map(t => t.value)));
    }

    const bannerStats = useMemo(() => computeBannerStats(wishes, game), [wishes, game]);
    const wishPityData = useMemo(() => computeWishPity(wishes, game), [wishes, game]);

    const currentStats = useMemo(() => {
        return bannerStats[activeBanner.id] || {
            total: 0, fiveStar: 0, fourStar: 0,
            currentPity5: 0, currentPity4: 0,
            avgPity5: 0, winRate5050: 0,
        };
    }, [bannerStats, activeBanner.id]);

    const bannerPityData = useMemo(() => {
        return wishPityData.filter(w => getBannerId(game.id, w.gacha_type) === activeBanner.id);
    }, [wishPityData, game.id, activeBanner.id]);

    const rarityCounts = useMemo(() => {
        const counts: Record<number, number> = {};
        game.rarityTiers.forEach(tier => {
            counts[tier.value] = 0;
        });
        bannerPityData.forEach(w => {
            if (counts[w.rarity] !== undefined) {
                counts[w.rarity]++;
            }
        });
        return counts;
    }, [bannerPityData, game.rarityTiers]);

    const pullNumberMap = useMemo(() => {
        const map = new Map<string, number>();
        bannerPityData.forEach((w, i) => map.set(w.id, bannerPityData.length - i));
        return map;
    }, [bannerPityData]);

    const recentPityData = useMemo(() => {
        const tierValues = [...recentRarities];
        return wishPityData.filter(w => {
            const bannerId = getBannerId(game.id, w.gacha_type);
            return bannerId === activeBanner.id && tierValues.includes(w.rarity);
        });
    }, [wishPityData, game, activeBanner.id, recentRarities]);

    const recentPaginated = useMemo(() => {
        const start = (recentPage - 1) * recentPerPage;
        return recentPityData.slice(start, start + recentPerPage);
    }, [recentPityData, recentPage, recentPerPage]);

    const filtered = useMemo(() => {
        return wishPityData.filter(w => {
            if (getBannerId(game.id, w.gacha_type) !== activeBanner.id) return false;
            if (!activeRarities.has(w.rarity)) return false;
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return w.name.toLowerCase().includes(q)
                || String(w.pity).includes(q)
                || formatWishTime(w.time).toLowerCase().includes(q);
        });
    }, [wishPityData, activeRarities, searchQuery, game.id, activeBanner.id]);

    const lowestRarity = Math.min(...game.rarityTiers.map(t => t.value));

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = useMemo(() => {
        return filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
    }, [filtered, safePage, rowsPerPage]);

    const toggleRecentRarity = (rarity: number) => {
        setRecentRarities(prev => {
            const next = new Set(prev);
            if (next.has(rarity)) {
                next.delete(rarity);
                if (next.size === 0) {
                    return new Set(topRarities.map(t => t.value));
                }
            } else {
                next.add(rarity);
            }
            return next;
        });
        setRecentPage(1);
    };

    const toggleRarity = (rarity: number) => {
        setActiveRarities(prev => {
            const next = new Set(prev);
            if (next.has(rarity)) {
                next.delete(rarity);
            } else {
                next.add(rarity);
            }
            return next;
        });
        setCurrentPage(1);
    };

    return {
        activeBanner, setActiveBanner,
        searchQuery, setSearchQuery,
        activeRarities, toggleRarity,
        currentPage, setCurrentPage,
        rowsPerPage, setRowsPerPage,
        recentPage, setRecentPage,
        recentPerPage, setRecentPerPage,
        recentRarities, toggleRecentRarity,
        topRarities,
        bannerStats,
        currentStats,
        rarityCounts,
        pullNumberMap,
        recentPityData,
        recentPaginated,
        filtered,
        paginated,
        totalPages,
        lowestRarity,
    };
}
