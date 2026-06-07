"use client";

import { RarityTier } from "@/config/games";
import { WishData } from "@/hooks/useWishes";
import { getItemIconPath } from "@/utils/assets";
import PaginationFooter from "@/components/common/PaginationFooter";

interface RecentPullsSectionProps {
    gameId: string;
    pullName: string;
    topRarities: RarityTier[];
    recentRarities: Set<number>;
    onToggleRecentRarity: (rarity: number) => void;
    recentPaginated: (WishData & { pity: number })[];
    recentPityDataLength: number;
    recentPage: number;
    onRecentPageChange: (page: number) => void;
    recentPerPage: number;
    onRecentPerPageChange: (perPage: number) => void;
    total: number;
}

export default function RecentPullsSection({
    gameId, pullName, topRarities, recentRarities,
    onToggleRecentRarity, recentPaginated, recentPityDataLength,
    recentPage, onRecentPageChange, recentPerPage, onRecentPerPageChange,
    total,
}: RecentPullsSectionProps) {
    return (
        <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-4 sm:p-5">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Recent {pullName}</h2>
                <div className="flex gap-2">
                    {topRarities.map(tier => {
                        const active = recentRarities.has(tier.value);
                        return (
                            <button
                                key={tier.value}
                                onClick={() => onToggleRecentRarity(tier.value)}
                                className={`cursor-pointer px-3 py-1 text-xs font-bold rounded transition-colors ${active
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

            {total > 0 ? (
                <>
                    <div className="flex flex-wrap gap-4">
                        {recentPaginated.map((wish) => {
                            const iconPath = getItemIconPath(gameId, wish.name);
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

                    <PaginationFooter
                        page={recentPage}
                        onPageChange={onRecentPageChange}
                        totalItems={recentPityDataLength}
                        perPage={recentPerPage}
                        onPerPageChange={onRecentPerPageChange}
                        perPageOptions={[20, 40, 60, 100]}
                        itemLabel="Items per page"
                    />
                </>
            ) : (
                <div className="text-center py-10 text-gray-400">No {pullName.toLowerCase()} recorded for this banner.</div>
            )}
        </div>
    );
}
