"use client";

import Link from "next/link";
import { getCurrentGame } from "@/config/games";

export default function HomePage() {
    const game = getCurrentGame();

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                <span className="">SENTI</span><span className="text-blue-500">.MOE</span>
            </h1>
            <p className="text-xl text-white max-w-2xl mb-12">
                A page for tracking and analyzing your {game.name} gacha rolls. 
                View your stats, track your pity, and manage multiple accounts with ease.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                    href="/dashboard/tracker"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                >
                    View Tracker
                </Link>
                <Link
                    href="/dashboard/import"
                    className="px-8 py-3 bg-[#1c1d21] border border-[#33343a] hover:border-blue-500 text-white font-bold rounded-lg transition-colors"
                >
                    Import Wishes
                </Link>
            </div>
        </div>
    );
}
