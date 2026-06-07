"use client";

import { BannerConfig } from "@/config/games";
import { BannerStats } from "@/utils/stats";

interface BannerSummaryCardProps {
    banner: BannerConfig;
    stats: BannerStats;
    pullName: string;
    currencyName: string;
}

export default function BannerSummaryCard({ banner, stats, pullName, currencyName }: BannerSummaryCardProps) {
    return (
        <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-4 z-10">{banner.name}</h2>
            <div className="grid grid-cols-2 gap-4 z-10">
                <div>
                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Total {pullName}</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div>
                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Total {currencyName}</p>
                    <p className="text-2xl font-bold text-white">{(stats.total * 160).toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-yellow-500 text-xs font-medium uppercase tracking-wider mb-1">5✦ {pullName}</p>
                    <p className="text-xl font-bold text-yellow-400">{stats.fiveStar}</p>
                </div>
                <div>
                    <p className="text-purple-500 text-xs font-medium uppercase tracking-wider mb-1">4✦ {pullName}</p>
                    <p className="text-xl font-bold text-purple-400">{stats.fourStar}</p>
                </div>
            </div>
        </div>
    );
}
