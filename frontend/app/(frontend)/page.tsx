"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { GAME_CONFIG, type GameConfig } from "@/config/games";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import GameCard from "@/components/common/GameCard";
import SearchInput from "@/components/common/ui/SearchInput";
import SocialCards from "@/components/common/social/SocialCards";
import SocialButton from "@/components/common/social/SocialButton";
import Footer from "@/components/common/ui/Footer";
import ChangelogSection from "@/components/common/changelog/ChangelogSection";
import AuthModal from "./(main)/auth/components/AuthModal";

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
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { user, logout } = useAuth();
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
                <header className={`sticky top-0 z-50 flex items-center justify-between px-5 py-3 transition-all duration-700 border-b ${
                    scrolled
                        ? "bg-[#1c1d21]/90 border-[#33343a] shadow-md"
                        : "bg-transparent border-transparent"
                }`}>
                    <div className="flex items-center gap-8">
                        <Link
                            href="/"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="text-2xl font-black text-white hover:text-theme tracking-widest cursor-pointer"
                        >
                            SENTI<span className="text-theme">.MOE</span>
                        </Link>
                        <nav className="hidden md:flex space-x-6 text-sm font-semibold">
                            <a href="#" className="text-white border-b-2 border-theme hover:text-white pb-1">Home</a>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex">
                            <SocialButton type="discord" variant="full" />
                        </div>
                        <div className="hidden sm:flex">
                            <SocialButton type="kofi" variant="full" />
                        </div>

                        {user ? (
                            <div className="relative z-50 ml-2">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 bg-[#1c1d21]/80 hover:bg-[#24252a] border border-[#33343a] hover:border-gray-500 rounded-full py-1 pr-3 pl-1 transition-all cursor-pointer"
                                >
                                    {user.avatar || user.picture ? (
                                        <img src={user.avatar || user.picture} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-theme flex items-center justify-center text-xs font-bold text-white">
                                            {user.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <span className="text-sm font-bold text-theme">{user.name}</span>
                                    <svg className={`w-4 h-4 text-theme transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isUserMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                                        <div className="absolute right-0 mt-2 w-48 bg-[#1c1d21] border border-[#33343a] hover:border-theme rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
                                            <button
                                                onClick={() => { setIsUserMenuOpen(false); logout(); }}
                                                className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-[#24252a] hover:border-transparent transition-colors text-left w-full cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Sign out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="ml-2 px-5 py-2 bg-theme border border-transparent hover:bg-transparent hover:border-theme text-white rounded text-sm font-bold transition-colors shadow-md cursor-pointer"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </header>

                <main className="max-w-[1200px] mx-auto p-4 md:p-6 mt-6">
                    <section className="mb-10">
                        <div className="relative w-full h-32 md:h-40 flex items-center justify-center group cursor-pointer">
                            <div className="relative z-10 text-center px-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wide uppercase">SENTI<span className="text-theme">.MOE</span></h1>
                                <p className="text-white text-sm md:text-base">
                                    Your tracker for dailies, events, and other content for your gacha games.
                                    This is currently being maintained solo so I would appreciate any support and feedback!
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

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
}
