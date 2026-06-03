"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { BannerConfig } from "@/config/games";
import { useGame } from "@/contexts/GameContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useWishes } from "@/hooks/useWishes";
import { computeBannerStats, computeWishPity } from "@/utils/stats";
import { getPityCap } from "@/config/gachaMechanics";
import { getBannerId } from "@/utils/gachaTypes";

function formatWishTime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function getItemIconPath(gameId: string, itemName: string): string {
    const name = itemName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `/assets/${gameId}/${name}-icon.png`;
}

export default function WishTrackerPage() {
    const { activeGame: game } = useGame();
    const { activeAccount } = useSettings();
    const [activeBanner, setActiveBanner] = useState<BannerConfig>(game.banners[0]);

    const { wishes, loading, error } = useWishes(game.id, activeAccount?.id);
    const bannerStats = computeBannerStats(wishes, game);
    const wishPityData = computeWishPity(wishes, game);
    const currentStats = bannerStats[activeBanner.id] || { total: 0, fiveStar: 0, fourStar: 0, currentPity5: 0, currentPity4: 0, avgPity5: 0, winRate5050: 0 };
    const activeBannerWishes = wishes.filter(w => getBannerId(game.id, w.gacha_type) === activeBanner.id);

    const topRarities = useMemo(() => {
        const sorted = [...game.rarityTiers].sort((a, b) => b.value - a.value);
        return sorted.slice(0, 2);
    }, [game]);

    const [recentRarities, setRecentRarities] = useState<Set<number>>(
        new Set(topRarities.map(t => t.value))
    );

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
    };

    const recentPityData = useMemo(() => {
        const tierValues = [...recentRarities];
        return wishPityData.filter(w => {
            const bannerId = getBannerId(game.id, w.gacha_type);
            return bannerId === activeBanner.id && tierValues.includes(w.rarity);
        });
    }, [wishPityData, game, activeBanner.id, recentRarities]);

    const recentToShow = useMemo(() => {
        const sortedTiers = [...recentRarities].sort((a, b) => b - a);
        const result: (typeof wishPityData)[number][] = [];
        for (const tierValue of sortedTiers) {
            let count = 0;
            for (const w of recentPityData) {
                if (w.rarity === tierValue) {
                    result.push(w);
                    count++;
                    if (count >= 5) break;
                }
            }
        }
        return result;
    }, [recentPityData, recentRarities]);

    // Pull History filters & pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [activeRarities, setActiveRarities] = useState<Set<number>>(
        new Set(game.rarityTiers.map(t => t.value))
    );
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

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

    const filtered = useMemo(() => {
        return wishPityData.filter(w => {
            if (!activeRarities.has(w.rarity)) return false;
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return w.name.toLowerCase().includes(q)
                || String(w.pity).includes(q)
                || formatWishTime(w.time).toLowerCase().includes(q);
        });
    }, [wishPityData, activeRarities, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = useMemo(() => {
        return filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
    }, [filtered, safePage, rowsPerPage]);

    function goToPage(page: number) {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }

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
                    <p className="text-gray-200 text-sm mt-2">
                        View your recent {game.pullName.toLowerCase()} & statistics compared to other {game.name} users.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#1c1d21] hover:bg-[#2a2b30] border border-[#52525b] text-gray-200 rounded-md transition-colors text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                        </svg>
                        Recover {game.pullName}
                    </button>
                    <Link
                        href="/dashboard/import"
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#1c1d21] hover:bg-[#2a2b30] border border-[#52525b] text-gray-200 rounded-md transition-colors text-sm font-medium"
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

            {loading && <div className="w-full text-center py-10 text-gray-300">Loading wishes...</div>}
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
                                    className={`cursor-pointer w-full text-left rounded-lg p-4 transition-all duration-200 border relative overflow-hidden flex flex-col min-h-[140px] shrink-0 ${
                                        isActive 
                                            ? "bg-[#2a2b30] border-[#4a4b52]" 
                                            : "bg-[#1c1d21] border-[#52525b] hover:border-gray-500"
                                    }`}
                                >
                                    {banner.cardImage && (
                                        <div className="absolute right-0 top-0 w-1/2 h-full">
                                            <img src={banner.cardImage} alt="" className="w-full h-full object-cover object-right" />
                                        </div>
                                    )}
                                    
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-yellow-400">{bannerStat.currentPity5}</span>
                                                <span className="text-gray-300 text-sm">/ {getPityCap(game.id, banner.type)}</span>
                                            </div>
                                            <p className="text-xs text-yellow-500 font-medium">5✦ Pity</p>
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold text-purple-400">{bannerStat.currentPity4}</span>
                                                <span className="text-gray-300 text-sm">/ {getPityCap(game.id, banner.type, 'fourStar')}</span>
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
                                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Total {game.pullName}</p>
                                    <p className="text-2xl font-bold text-white">{currentStats.total}</p>
                                </div>
                                <div>
                                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Total {game.currencyName}</p>
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
                                        <span className="text-gray-200">Average Pity</span>
                                        <span className="text-white font-medium">{currentStats.avgPity5 > 0 ? currentStats.avgPity5 : '-'}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#2a2b30] rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: currentStats.avgPity5 ? `${(currentStats.avgPity5 / 90) * 100}%` : '0%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-200">50/50 Wins</span>
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
                                {topRarities.map(tier => {
                                    const active = recentRarities.has(tier.value);
                                    return (
                                        <button
                                            key={tier.value}
                                            onClick={() => toggleRecentRarity(tier.value)}
                                            className={`cursor-pointer px-3 py-1 text-xs font-bold rounded transition-colors ${
                                                active
                                                    ? `${tier.color} bg-[#2a2b30] border border-[#52525b]`
                                                    : 'text-gray-500 bg-transparent border border-[#3a3a3e]'
                                            }`}
                                        >
                                            {tier.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {currentStats.total > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {recentToShow.map((wish) => {
                                    const iconPath = getItemIconPath(game.id, wish.name);
                                    return (
                                        <div key={wish.id} className="relative w-14 h-14">
                                            <div className="w-full h-full rounded-full bg-[#2a2b30] border border-[#52525b] overflow-hidden flex items-center justify-center text-gray-300 text-xs font-medium">
                                                <img
                                                    src={iconPath}
                                                    alt={wish.name}
                                                    className="w-full h-full object-cover"
                                                    onError={e => {
                                                        const img = e.target as HTMLImageElement;
                                                        img.style.display = 'none';
                                                        const parent = img.parentElement;
                                                        if (parent && !parent.querySelector('.fallback')) {
                                                            const fb = document.createElement('span');
                                                            fb.className = 'fallback';
                                                            fb.textContent = wish.name[0]?.toUpperCase() || '?';
                                                            parent.appendChild(fb);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <span className="absolute -bottom-1 -right-1 bg-[#1c1d21] border border-[#52525b] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                                                {wish.pity}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400">No {game.pullName.toLowerCase()} recorded for this banner.</div>
                        )}
                    </div>

                    {/* Pull History Table */}
                    <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">Pull History</h2>
                        </div>

                        {/* Filter row */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search across columns..."
                                className="flex-1 bg-[#27272a] border border-[#52525b] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gray-500"
                            />
                            <div className="flex gap-2 items-center">
                                {game.rarityTiers.map(tier => {
                                    const active = activeRarities.has(tier.value);
                                    return (
                                        <button
                                            key={tier.value}
                                            onClick={() => toggleRarity(tier.value)}
                                            className={`cursor-pointer px-3 py-1 text-xs font-bold rounded transition-colors ${
                                                active
                                                    ? `${tier.color} bg-[#2a2b30] border border-[#52525b]`
                                                    : 'text-gray-500 bg-transparent border border-[#3a3a3e]'
                                            }`}
                                        >
                                            {tier.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-300 text-xs uppercase border-b border-[#52525b]">
                                        <th className="pb-3 font-medium">Pull No.</th>
                                        <th className="pb-3 font-medium">Item Name</th>
                                        <th className="pb-3 font-medium">Pity</th>
                                        <th className="pb-3 font-medium">Date Received</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-200">
                                    {paginated.map((wish, i) => {
                                        const pullNo = filtered.length - ((safePage - 1) * rowsPerPage + i);
                                        const tier = game.rarityTiers.find(t => t.value === wish.rarity);
                                        return (
                                            <tr key={wish.id} className="border-b border-[#52525b]/50 hover:bg-[#2a2b30]/30 transition-colors">
                                                <td className="py-3">{pullNo}</td>
                                                <td className={`py-3 font-medium ${tier?.color ?? 'text-gray-200'}`}>{wish.name}</td>
                                                <td className="py-3">{wish.pity}</td>
                                                <td className="py-3 text-gray-400">{formatWishTime(wish.time)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm text-gray-300">
                            <div className="flex items-center gap-2">
                                <span>Rows per page:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    className="cursor-pointer bg-[#27272a] border border-[#52525b] rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-gray-500"
                                >
                                    {[5, 10, 20, 50].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(1)}
                                    disabled={safePage === 1}
                                    className="cursor-pointer px-2 py-1 rounded hover:bg-[#2a2b30] disabled:text-gray-500 disabled:hover:bg-transparent transition-colors"
                                >&lt;&lt;</button>
                                <button
                                    onClick={() => goToPage(safePage - 1)}
                                    disabled={safePage === 1}
                                    className="cursor-pointer px-2 py-1 rounded hover:bg-[#2a2b30] disabled:text-gray-500 disabled:hover:bg-transparent transition-colors"
                                >&lt;</button>
                                <span className="px-3 py-1 text-white">
                                    {filtered.length > 0 ? safePage : 0} / {totalPages}
                                </span>
                                <button
                                    onClick={() => goToPage(safePage + 1)}
                                    disabled={safePage === totalPages}
                                    className="cursor-pointer px-2 py-1 rounded hover:bg-[#2a2b30] disabled:text-gray-500 disabled:hover:bg-transparent transition-colors"
                                >&gt;</button>
                                <button
                                    onClick={() => goToPage(totalPages)}
                                    disabled={safePage === totalPages}
                                    className="cursor-pointer px-2 py-1 rounded hover:bg-[#2a2b30] disabled:text-gray-500 disabled:hover:bg-transparent transition-colors"
                                >&gt;&gt;</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
