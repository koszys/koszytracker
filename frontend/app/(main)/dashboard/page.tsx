"use client";

import Link from "next/link";
import { useGame } from "@/contexts/GameContext";

export default function HomePage() {
    const { activeGame: game } = useGame();

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-md tracking-widest">
                <span>SENTI</span><span className="text-theme">.MOE</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-12 font-medium">
                A page for tracking and analyzing your {game.name} gacha rolls. 
                View your stats, track your pity, and manage multiple accounts with ease.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                    href="/dashboard/tracker"
                    className="px-8 py-3 bg-theme hover:brightness-110 hover:border-white text-white font-bold rounded-lg transition-all shadow-lg border border-theme/50"
                >
                    View Tracker
                </Link>
                <Link
                    href="/dashboard/import"
                    className="px-8 py-3 bg-[#27272a] border border-[#52525b] hover:bg-[#3f3f46] hover:border-white text-white font-bold rounded-lg transition-all"
                >
                    Import Wishes
                </Link>
            </div>
        </div>
    );
}
