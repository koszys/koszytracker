"use client";

import Link from "next/link";
import { useGame } from "@/contexts/GameContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useWishes } from "@/hooks/useWishes";
import { useWishTrackerState } from "@/hooks/useWishTrackerState";
import BannerSidebar from "@/components/tracker/BannerSidebar";
import BannerSummaryCard from "@/components/tracker/BannerSummaryCard";
import LuckRatingCard from "@/components/tracker/LuckRatingCard";
import RecentPullsSection from "@/components/tracker/RecentPullsSection";
import PullHistoryTable from "@/components/tracker/PullHistoryTable";

export default function WishTrackerPage() {
    const { activeGame: game } = useGame();
    const { activeAccount } = useSettings();
    const { wishes, loading, error } = useWishes(game.id, activeAccount?.id);
    const state = useWishTrackerState(game, wishes);

    return (
        <div className="w-full flex flex-col gap-6 relative items-stretch lg:flex-1 lg:min-h-0 lg:overflow-hidden">
            {/* Header */}
            <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{game.wishName}</h1>
                    <p className="text-gray-200 text-sm mt-2">
                        View your recent {game.pullName.toLowerCase()} & statistics compared to other {game.name} users.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#1c1d21] hover:bg-[#2a2b30] border border-[#52525b] text-gray-200 rounded-md transition-colors text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                        </svg>
                        Recover {game.pullName}
                    </button>
                    <Link
                        href="/dashboard/import"
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#1c1d21] hover:bg-[#2a2b30] border border-[#52525b] text-gray-200 rounded-md transition-colors text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        {game.importName}
                    </Link>
                </div>
            </div>

            {loading && <div className="w-full text-center py-10 text-gray-300">Loading wishes...</div>}
            {error && <div className="w-full bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300">Failed to load: {error}</div>}
            {!loading && !error && wishes.length === 0 && (
                <div className="w-full text-center py-10 text-white">
                    No pulls recorded. <Link href="/dashboard/import" className="text-blue-400 underline">Import your {game.pullName.toLowerCase()}</Link> to get started.
                </div>
            )}

            {/* Main content */}
            {!loading && !error && wishes.length > 0 && (
                <div className="w-full flex flex-col lg:flex-row gap-5 lg:gap-6 relative items-stretch lg:flex-1 lg:min-h-0">
                    <BannerSidebar
                        banners={game.banners}
                        bannerStats={state.bannerStats}
                        activeBannerId={state.activeBanner.id}
                        onBannerChange={state.setActiveBanner}
                        gameId={game.id}
                    />

                    <div className="flex-1 flex flex-col gap-5 lg:gap-6 pb-10 min-w-0 lg:h-full lg:overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
                            <BannerSummaryCard
                                banner={state.activeBanner}
                                stats={state.currentStats}
                                pullName={game.pullName}
                                currencyName={game.currencyName}
                            />
                            <LuckRatingCard
                                avgPity5={state.currentStats.avgPity5}
                                winRate5050={state.currentStats.winRate5050}
                            />
                        </div>

                        <RecentPullsSection
                            gameId={game.id}
                            pullName={game.pullName}
                            topRarities={state.topRarities}
                            recentRarities={state.recentRarities}
                            onToggleRecentRarity={state.toggleRecentRarity}
                            recentPaginated={state.recentPaginated}
                            recentPityDataLength={state.recentPityData.length}
                            recentPage={state.recentPage}
                            onRecentPageChange={state.setRecentPage}
                            recentPerPage={state.recentPerPage}
                            onRecentPerPageChange={state.setRecentPerPage}
                            total={state.currentStats.total}
                        />

                        <PullHistoryTable
                            searchQuery={state.searchQuery}
                            onSearchChange={state.setSearchQuery}
                            activeRarities={state.activeRarities}
                            onToggleRarity={state.toggleRarity}
                            rarityTiers={game.rarityTiers}
                            rarityCounts={state.rarityCounts}
                            paginated={state.paginated}
                            pullNumberMap={state.pullNumberMap}
                            currentPage={state.currentPage}
                            onPageChange={state.setCurrentPage}
                            rowsPerPage={state.rowsPerPage}
                            onRowsPerPageChange={state.setRowsPerPage}
                            filteredLength={state.filtered.length}
                            lowestRarity={state.lowestRarity}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
