"use client";

import Link from "next/link";
import { useState } from "react";
import { BannerConfig } from "@/config/games";
import { useGame } from "@/contexts/GameContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useWishes } from "@/hooks/useWishes";
import { computeBannerStats, computeWishPity } from "@/utils/stats";
import { getPityCap } from "@/config/gachaMechanics";
import { getBannerId } from "@/utils/gachaTypes";

export default function WishTrackerPage() {
    const { activeGame: game } = useGame();
    const { activeAccount } = useSettings();
    const [activeBanner, setActiveBanner] = useState<BannerConfig>(game.banners[0]);

    const { wishes, loading, error } = useWishes(game.id, activeAccount?.id);
    const bannerStats = computeBannerStats(wishes, game);
    const wishPityData = computeWishPity(wishes, game);
    const currentStats = bannerStats[activeBanner.id] || { total: 0, fiveStar: 0, fourStar: 0, currentPity5: 0, currentPity4: 0, avgPity5: 0, winRate5050: 0 };
    const activeBannerWishes = wishes.filter(w => getBannerId(game.id, w.gacha_type) === activeBanner.id);

    return (
        <div className="w-full flex flex-col gap-8 relative items-start">
            
            {/* Global Styles for completely hiding all scrollbars */}
            <style dangerouslySetInnerHTML={{__html: `
                /* Hide scrollbar for Chrome, Safari and Opera */
                ::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                body, html {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}} />

            {/* --- FULL-WIDTH HEADER --- */}
            <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{game.wishName}</h1>
                    <p className="text-gray-300 text-sm mt-2">
                        View your recent {game.pullName.toLowerCase()} & statistics compared to other {game.name} users.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1c1d21] hover:bg-[#2a2b30] border border-[#52525b] text-gray-300 rounded-md transition-colors text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                        </svg>
                        Recover {game.pullName}
                    </button>
                    <Link
                        href="/dashboard/import"
                        className="flex items-center gap-2 px-4 py-2 bg-[#1c1d21] hover:bg-[#2a2b30] border border-[#52525b] text-gray-300 rounded-md transition-colors text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                        {game.importName}
                    </Link>
                </div>
            </div>

            {loading && <div className="w-full text-center py-10 text-gray-400">Loading wishes...</div>}
            {error && <div className="w-full bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300">Failed to load: {error}</div>}
            {!loading && !error && wishes.length === 0 && (
                <div className="w-full text-center py-10">
                    No pulls recorded. <Link href="/dashboard/import" className="text-blue-400 underline">Import your {game.pullName.toLowerCase()}</Link> to get started.
                </div>
            )}

            {/* --- TWO COLUMN LAYOUT --- */}
            {!loading && !error && wishes.length > 0 && (
            <div className="w-full flex flex-col md:flex-row gap-6 relative items-start">
                
                {/* LEFT SIDEBAR: Banners (Scrollable but invisible scrollbar) */}
                <div className="w-full md:w-[320px] md:shrink-0 flex flex-col gap-4 h-[210px] md:h-[calc(100vh-10rem)] md:sticky md:top-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="flex flex-col gap-4 pb-4">
                        {game.banners.map((banner) => {
                            const bannerStat = bannerStats[banner.id] || { currentPity5: 0, currentPity4: 0 };
                            const isActive = activeBanner.id === banner.id;
                            
                            return (
                                <button
                                    key={banner.id}
                                    onClick={() => setActiveBanner(banner)}
                                    className={`w-full text-left rounded-lg p-4 transition-all duration-200 border relative overflow-hidden flex flex-col min-h-[140px] shrink-0 ${
                                        isActive 
                                            ? "bg-[#2a2b30] border-[#4a4b52]" 
                                            : "bg-[#1c1d21] border-[#52525b] hover:border-gray-500"
                                    }`}
                                >
                                    {/* The white gradient overlay has been completely removed here */}
                                    
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-yellow-400">{bannerStat.currentPity5}</span>
                                                <span className="text-gray-400 text-sm">/ {getPityCap(game.id, banner.type)}</span>
                                            </div>
                                            <p className="text-xs text-yellow-500 font-medium">5✦ Pity</p>
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold text-purple-400">{bannerStat.currentPity4}</span>
                                                <span className="text-gray-400 text-sm">/ {getPityCap(game.id, banner.type, 'fourStar')}</span>
                                            </div>
                                            <p className="text-xs text-purple-500 font-medium">4✦ Pity</p>
                                        </div>

                                        <p className="text-sm text-white font-medium mt-4">{banner.name}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT MAIN CONTENT: Stats */}
                <div className="flex-1 flex flex-col gap-6 pb-10 min-w-0">
                    
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Banner Summary Card */}
                        <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-6 flex flex-col justify-between relative overflow-hidden">
                            <h2 className="text-lg font-bold text-white mb-6 z-10">{activeBanner.name}</h2>
                            <div className="grid grid-cols-2 gap-4 z-10">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total {game.pullName}</p>
                                    <p className="text-2xl font-bold text-white">{currentStats.total}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total {game.currencyName}</p>
                                    <p className="text-2xl font-bold text-white">{(currentStats.total * 160).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-yellow-500 text-xs font-medium uppercase tracking-wider mb-1">5✦ {game.pullName}</p>
                                    <p className="text-xl font-bold text-yellow-400">{currentStats.fiveStar}</p>
                                </div>
                                <div>
                                    <p className="text-purple-500 text-xs font-medium uppercase tracking-wider mb-1">4✦ {game.pullName}</p>
                                    <p className="text-xl font-bold text-purple-400">{currentStats.fourStar}</p>
                                </div>
                            </div>
                        </div>

                        {/* Luck Rating Card */}
                        <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-6">
                            <h2 className="text-lg font-bold text-white mb-6">5✦ Luck Rating</h2>
                            
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Average Pity</span>
                                        <span className="text-white font-medium">{currentStats.avgPity5 > 0 ? currentStats.avgPity5 : '-'}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#2a2b30] rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: currentStats.avgPity5 ? `${(currentStats.avgPity5 / 90) * 100}%` : '0%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">50/50 Wins</span>
                                        <span className="text-white font-medium">{currentStats.winRate5050}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#2a2b30] rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${currentStats.winRate5050}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Pulls Section */}
                    <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">Recent {game.pullName}</h2>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-[#2a2b30] text-gray-300 text-xs font-bold rounded hover:text-white">4 ✦</button>
                                <button className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded">5 ✦</button>
                            </div>
                        </div>
                        
                        {currentStats.total > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {activeBannerWishes.slice(-5).reverse().map((wish) => (
                                    <div key={wish.id} className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                                        wish.rarity === 5 ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' :
                                        wish.rarity === 4 ? 'border-purple-500 bg-purple-500/10 text-purple-400' :
                                        'border-gray-600 bg-[#2a2b30] text-gray-400'
                                    }`}>
                                        {wish.name.length > 8 ? wish.name.slice(0, 6) + '…' : wish.name}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No {game.pullName.toLowerCase()} recorded for this banner.</div>
                        )}
                    </div>

                    {/* Pull History Table */}
                    <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">Pull History</h2>
                            <input 
                                type="text" 
                                placeholder="Search for something..." 
                                className="bg-[#27272a] border border-[#52525b] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gray-500"
                            />
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-400 text-xs uppercase border-b border-[#52525b]">
                                        <th className="pb-3 font-medium">Pull No.</th>
                                        <th className="pb-3 font-medium">Item Name</th>
                                        <th className="pb-3 font-medium">Pity</th>
                                        <th className="pb-3 font-medium">Date Received</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-300">
                                    {wishPityData.slice(0, 50).map((wish, i) => (
                                        <tr key={wish.id} className="border-b border-[#52525b]/50 hover:bg-[#2a2b30]/30 transition-colors">
                                            <td className="py-3">{wishPityData.length - i}</td>
                                            <td className={`py-3 font-medium ${
                                                wish.rarity === 5 ? 'text-yellow-400' :
                                                wish.rarity === 4 ? 'text-purple-400' :
                                                'text-gray-300'
                                            }`}>{wish.name}</td>
                                            <td className="py-3">{wish.pity}</td>
                                            <td className="py-3 text-gray-500">{wish.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
