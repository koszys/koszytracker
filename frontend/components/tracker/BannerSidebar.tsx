"use client";

import { BannerConfig } from "@/config/games";
import { BannerStats } from "@/utils/stats";
import { getPityCap } from "@/config/gachaMechanics";

interface BannerSidebarProps {
    banners: BannerConfig[];
    bannerStats: Record<string, BannerStats>;
    activeBannerId: string;
    onBannerChange: (banner: BannerConfig) => void;
    gameId: string;
}

export default function BannerSidebar({ banners, bannerStats, activeBannerId, onBannerChange, gameId }: BannerSidebarProps) {
    return (
        <div className="w-full lg:w-70 xl:w-[320px] lg:shrink-0 flex flex-col gap-4 h-60 lg:h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
            <div className="flex flex-col gap-4 pb-4">
                {banners.map((banner) => {
                    const bannerStat = bannerStats[banner.id] || { currentPity5: 0, currentPity4: 0 };
                    const isActive = activeBannerId === banner.id;

                    return (
                        <button
                            key={banner.id}
                            onClick={() => onBannerChange(banner)}
                            className={`cursor-pointer w-full text-left rounded-lg p-4 transition-all duration-200 border relative overflow-hidden flex flex-col min-h-35 shrink-0 ${isActive
                                ? "bg-[#2a2b30] border-[#4a4b52]"
                                : "bg-[#1c1d21] border-[#52525b] hover:border-gray-500"
                                }`}
                        >
                            {banner.cardImage && (
                                <div className="absolute right-0 top-0 w-1/2 h-full">
                                    <img src={banner.cardImage} alt="" className="w-full h-full object-cover object-top" />
                                </div>
                            )}

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-yellow-400">{bannerStat.currentPity5}</span>
                                        <span className="text-gray-300 text-sm">/ {getPityCap(gameId, banner.type)}</span>
                                    </div>
                                    <p className="text-xs text-yellow-500 font-medium">5✦ Pity</p>
                                </div>

                                <div className="mt-3">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-purple-400">{bannerStat.currentPity4}</span>
                                        <span className="text-gray-300 text-sm">/ {getPityCap(gameId, banner.type, 'fourStar')}</span>
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
    );
}
