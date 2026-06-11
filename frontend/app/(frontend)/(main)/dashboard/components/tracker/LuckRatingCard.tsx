"use client";

interface LuckRatingCardProps {
    avgPity5: number;
    winRate5050: number;
}

export default function LuckRatingCard({ avgPity5, winRate5050 }: LuckRatingCardProps) {
    return (
        <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-4 sm:p-5">
            <h2 className="text-lg font-bold text-white mb-4">5✦ Luck Rating</h2>

            <div className="space-y-5">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-200">Average Pity</span>
                        <span className="text-white font-medium">{avgPity5 > 0 ? avgPity5 : '-'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#2a2b30] rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: avgPity5 ? `${(avgPity5 / 90) * 100}%` : '0%' }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-200">50/50 Wins</span>
                        <span className="text-white font-medium">{winRate5050}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#2a2b30] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${winRate5050}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
