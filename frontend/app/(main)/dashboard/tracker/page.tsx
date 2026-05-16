"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentGame } from "@/config/games";

interface WishStats {
    total: number;
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    fiveStarRate: number;
    avgPity: number;
}

export default function WishTrackerPage() {
    const game = getCurrentGame();
    const [stats, setStats] = useState<WishStats>({
        total: 0,
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        fiveStarRate: 0,
        avgPity: 0,
    });

    useEffect(() => {
        const stored = localStorage.getItem(`wishes-${game.id}`);
        if (stored) {
            try {
                const wishes = JSON.parse(stored);
                const fiveStars = wishes.filter((w: { rarity: number }) => w.rarity === 5).length;
                const fourStars = wishes.filter((w: { rarity: number }) => w.rarity === 4).length;
                const threeStars = wishes.filter((w: { rarity: number }) => w.rarity === 3).length;
                const total = wishes.length;

                const newStats = {
                    total,
                    fiveStar: fiveStars,
                    fourStar: fourStars,
                    threeStar: threeStars,
                    fiveStarRate: total > 0 ? Math.round((fiveStars / total) * 1000) / 10 : 0,
                    avgPity: 0,
                };
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setStats(newStats);
            } catch {
                // Invalid data, ignore
            }
        }
    }, [game.id]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">{game.wishName}</h1>
                    <p className="text-gray-400 text-sm mt-1">View and track your {game.name} wishes</p>
                </div>
                <Link
                    href="/dashboard/import"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-bold"
                >
                    <span>📥</span>
                    <span>{game.importName}</span>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-[#1c1d21] border border-[#33343a] rounded-lg p-4 md:p-6">
                    <p className="text-gray-400 text-sm">Total Wishes</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <div className="bg-[#1c1d21] border border-[#33343a] rounded-lg p-4 md:p-6">
                    <p className="text-gray-400 text-sm">5-Star</p>
                    <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.fiveStar}</p>
                </div>
                <div className="bg-[#1c1d21] border border-[#33343a] rounded-lg p-4 md:p-6">
                    <p className="text-gray-400 text-sm">4-Star</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">{stats.fourStar}</p>
                </div>
                <div className="bg-[#1c1d21] border border-[#33343a] rounded-lg p-4 md:p-6">
                    <p className="text-gray-400 text-sm">3-Star</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{stats.threeStar}</p>
                </div>
                <div className="bg-[#1c1d21] border border-[#33343a] rounded-lg p-4 md:p-6">
                    <p className="text-gray-400 text-sm">5-Star Rate</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.fiveStarRate}%</p>
                </div>
                <div className="bg-[#1c1d21] border border-[#33343a] rounded-lg p-4 md:p-6">
                    <p className="text-gray-400 text-sm">Avg Pity</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.avgPity || '-'}</p>
                </div>
            </div>

            {/* Banner Breakdown */}
            <div className="bg-[#1c1d21] border border-[#33343a] rounded-lg p-6 mb-8">
                <h2 className="text-lg font-bold text-white mb-4">Banner Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#121212] border border-[#33343a] rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-2">Character Event</p>
                        <p className="text-2xl font-bold text-white">0 wishes</p>
                    </div>
                    <div className="bg-[#121212] border border-[#33343a] rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-2">Weapon Event</p>
                        <p className="text-2xl font-bold text-white">0 wishes</p>
                    </div>
                    <div className="bg-[#121212] border border-[#33343a] rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-2">Standard</p>
                        <p className="text-2xl font-bold text-white">0 wishes</p>
                    </div>
                    <div className="bg-[#121212] border border-[#33343a] rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-2">Chronicled</p>
                        <p className="text-2xl font-bold text-white">0 wishes</p>
                    </div>
                </div>
            </div>

            {/* Getting Started */}
            {stats.total === 0 && (
                <div className="bg-[#1c1d21] border border-[#33343a] rounded-lg p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Getting Started</h2>
                    <p className="text-gray-400 mb-4">
                        Import your wish history to see detailed statistics and track your pulls.
                    </p>
                    <Link
                        href="/dashboard/import"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-bold"
                    >
                        <span>📥</span>
                        <span>{game.importName}</span>
                    </Link>
                </div>
            )}

            {/* Recent Wishes */}
            {stats.total > 0 && (
                <div className="bg-[#1c1d21] border border-[#33343a] rounded-lg p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Recent Wishes</h2>
                    <p className="text-gray-400 text-center py-8">
                        No wish history yet. Import your wishes to get started.
                    </p>
                </div>
            )}
        </div>
    );
}