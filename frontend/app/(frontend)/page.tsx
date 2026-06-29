"use client";

import { useState, useEffect, useMemo } from "react";
import { GAME_CONFIG, type GameConfig } from "@/config/games";
import { useGame } from "@/contexts/GameContext";
import GameCard from "@/components/common/GameCard";
import SearchInput from "@/components/common/ui/SearchInput";
import SocialCards from "@/components/common/social/SocialCards";
import Footer from "@/components/common/ui/Footer";
import ChangelogSection from "@/components/common/changelog/ChangelogSection";
import Header from "@/components/common/Header";

const BACKGROUNDS = GAME_CONFIG.map(game => game.bgUrl);

function preloadImage(src: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });
}

export default function HomePage() {
    const [currentBg, setCurrentBg] = useState<string | null>(null);
    const [isBgLoaded, setIsBgLoaded] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { recentGameIds } = useGame();

    const sortedGames = useMemo(() => {
        return [...GAME_CONFIG].sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const filteredActiveGames = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return sortedGames.filter(game => game.status === 'active' && game.name.toLowerCase().includes(q));
    }, [searchQuery, sortedGames]);

    const filteredComingSoonGames = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return sortedGames.filter(game => game.status === 'comingsoon' && game.name.toLowerCase().includes(q));
    }, [searchQuery, sortedGames]);

    const recentGames = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return recentGameIds
            .map(id => GAME_CONFIG.find(g => g.id === id))
            .filter((g): g is GameConfig => g !== undefined)
            .filter(game => game.name.toLowerCase().includes(q));
    }, [recentGameIds, searchQuery]);

    useEffect(() => {
        const savedBg = localStorage.getItem("senti-last-bg");
        const bgToUse = savedBg || BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
        preloadImage(bgToUse).then(() => {
            setCurrentBg(bgToUse);
            setIsBgLoaded(true);
        });
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleHover = (bgUrl: string) => {
        if (currentBg === bgUrl) return;
        setIsBgLoaded(false);
        preloadImage(bgUrl).then(() => {
            setCurrentBg(bgUrl);
            setIsBgLoaded(true);
            localStorage.setItem("senti-last-bg", bgUrl);
        });
    };

    return (
        <div className="min-h-screen bg-[#121212] text-gray-300 font-sans selection:bg-theme selection:text-white relative">
            {currentBg && (
                <div
                    className={`fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${isBgLoaded ? "opacity-40" : "opacity-0"}`}
                    style={{ backgroundImage: `url('${currentBg}')` }}
                />
            )}

            <div className="relative z-10">
                <Header
                    navLinks={[{ name: "Home", href: "#", isActive: true }]}
                    scrolled={scrolled}
                />

                <main className="max-w-[1200px] mx-auto p-4 md:p-6 mt-6">
                    <section className="mb-10">
                        <div className="relative w-full h-32 md:h-40 flex items-center justify-center group cursor-pointer">
                            <div className="relative z-10 text-center px-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wide uppercase">SENTI<span className="text-theme">.MOE</span></h1>
                                <p className="text-white text-sm md:text-base">
                                    A kind of hub for certain gacha games that I play (doing it for experience as well lol). I'll try to add as many games as I can but this site is currently being maintained solo so I appreciate any support and feedback!
                                </p>
                            </div>
                        </div>
                    </section>

                    <SearchInput value={searchQuery} onChange={setSearchQuery} />
                    {/* Remove false && to show the recently chosen list again. Hiding for now since not too many games currently */}
                    {false && recentGames.length > 0 && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider border-l-4 border-theme pl-3">
                                    Recently Chosen
                                </h2>
                            </div>
                            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                                {recentGames.map((game) => (
                                    <GameCard
                                        key={game.id}
                                        gameId={game.id}
                                        name={game.name}
                                        status={game.status}
                                        bgUrl={game.bgUrl}
                                        link={`/${game.id}`}
                                        onHover={handleHover}
                                    />
                                ))}
                            </section>
                        </>
                    )}

                    {filteredActiveGames.length > 0 && (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-4 border-theme pl-3">
                                    Supported Games
                                </h2>
                            </div>
                            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredActiveGames.map((game) => (
                                    <GameCard
                                        key={game.id}
                                        gameId={game.id}
                                        name={game.name}
                                        status={game.status}
                                        bgUrl={game.bgUrl}
                                        link={`/${game.id}`}
                                        onHover={handleHover}
                                    />
                                ))}
                            </section>
                        </>
                    )}

                    {filteredComingSoonGames.length > 0 && (
                        <>
                            <div className="flex items-center justify-between mt-10 mb-6">
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-4 border-theme pl-3">
                                    Coming Soon
                                </h2>
                            </div>
                            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredComingSoonGames.map((game) => (
                                    <GameCard
                                        key={game.id}
                                        gameId={game.id}
                                        name={game.name}
                                        status={game.status}
                                        bgUrl={game.bgUrl}
                                        link={`/${game.id}`}
                                        onHover={handleHover}
                                    />
                                ))}
                            </section>
                        </>
                    )}

                    {filteredActiveGames.length === 0 && filteredComingSoonGames.length === 0 && (
                        <p className="text-gray-200 text-sm text-center py-8">No games match your search.</p>
                    )}

                    <SocialCards />

                    <ChangelogSection game="main" />

                    <Footer />
                </main>
            </div>

        </div>
    );
}
