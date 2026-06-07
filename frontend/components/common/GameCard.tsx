"use client";

import Link from "next/link";
import { useGame } from "@/contexts/GameContext";

interface GameCardProps {
    gameId: string;
    name: string;
    status: string;
    bgUrl: string;
    link: string;
    onHover: (bgUrl: string) => void;
}

export default function GameCard({ gameId, name, status, bgUrl, link, onHover }: GameCardProps) {
    const { setActiveGameId } = useGame();
    const isComingSoon = status === "comingsoon";

    const cardContent = (
        <div
            className={`relative group h-36 sm:h-45 rounded-md overflow-hidden border border-[#33343a] transition-all duration-300
                ${isComingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"}`}
            onMouseEnter={() => onHover(bgUrl)}
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${bgUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1d21] via-[#1c1d21]/60 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                <h3 className="font-bold text-white text-lg drop-shadow-lg">{name}</h3>
                {isComingSoon && (
                    <span className="text-xs text-gray-400 font-semibold drop-shadow-lg">Coming Soon</span>
                )}
            </div>
        </div>
    );

    if (isComingSoon) {
        return cardContent;
    }

    return (
        <Link href={link} onClick={() => setActiveGameId(gameId)}>
            {cardContent}
        </Link>
    );
}
