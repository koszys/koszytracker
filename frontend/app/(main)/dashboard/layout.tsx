"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { GAME_CONFIG, getCurrentGame } from "@/config/games";
import { SettingsProvider } from "@/contexts/SettingsContext";
import SocialButton from "@/components/common/SocialButton";
import Footer from "@/components/common/Footer";

const currentGame = getCurrentGame();

const navLinks = [
    { name: "Wish Tracker", path: "/dashboard/tracker", icon: "/assets/genshin/genshin-wish.png", dynamicName: currentGame.wishName },
    { name: "Import Wishes", path: "/dashboard/import", icon: "/assets/genshin/genshin-cursor.png", dynamicName: currentGame.importName },
    { name: "Settings", path: "/dashboard/settings", icon: "/assets/genshin/settings-icon.webp" },
];

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isGameSwitcherOpen, setIsGameSwitcherOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const iconButtonClass = "p-1.5 text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-blue-500 rounded-md transition-all flex items-center justify-center";

    return (
        <div className="relative flex h-screen w-full bg-[#121212] text-gray-300 font-sans selection:bg-blue-500 selection:text-white overflow-hidden">

            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none"
                style={{ backgroundImage: currentGame.bgUrl ? `url('${currentGame.bgUrl}')` : currentGame.bgColor }}
            />

            {/* Mobile nav overlay */}
            {isMobileNavOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-40 md:hidden transition-all"
                    onClick={() => setIsMobileNavOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 bg-[#1c1d21] border-r border-[#33343a] flex flex-col flex-shrink-0
                transition-all duration-300 ease-in-out
                ${isMobileNavOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
                ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
            `}>

                {/* Logo */}
                <div className="h-16 flex items-center justify-center px-4 border-b border-[#33343a] flex-shrink-0">
                    {(!isSidebarCollapsed || isMobileNavOpen) ? (
                        <Link href="/dashboard" className="text-xl font-black text-white tracking-widest overflow-hidden whitespace-nowrap w-full text-left hover:text-blue-500 transition-colors">
                            SENTI<span className="text-blue-500">.MOE</span>
                        </Link>
                    ) : (
                        <Link href="/dashboard" className="text-xl font-black text-white tracking-widest hover:text-blue-500 transition-colors">
                            S<span className="text-blue-500">.</span>
                        </Link>
                    )}

                    <button onClick={() => setIsMobileNavOpen(false)} className={`md:hidden ml-auto ${iconButtonClass}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Home Link - Simple style like nav links */}
                <nav className="p-3 flex flex-col gap-2 overflow-y-auto">
                    <Link
                        href="/dashboard"
                        className={`
                            flex items-center rounded-md font-bold text-sm transition-all whitespace-nowrap overflow-hidden
                            ${isSidebarCollapsed && !isMobileNavOpen ? 'justify-center p-3' : 'px-4 py-3 gap-3'}
                            ${pathname === '/dashboard'
                                ? 'bg-gray-400/20 text-white hover:text-white border border-blue-500'
                                : 'text-gray-400 hover:bg-[#2a2b30] hover:text-white border border-transparent'}
                        `}
                    >
                        <Image
                            src="/assets/genshin/genshin-statue.png"
                            alt="Home"
                            width={24}
                            height={24}
                            className="w-6 h-6 flex-shrink-0"
                        />
                        {(!isSidebarCollapsed || isMobileNavOpen) && <span>Home</span>}
                    </Link>
                </nav>

                {/* Game Switcher */}
                <div className="px-3 pb-3">
                    <button
                        onClick={() => setIsGameSwitcherOpen(true)}
                        className={`
                            cursor-pointer group relative w-full rounded-md overflow-hidden border border-[#33343a] hover:border-blue-500 transition-all shadow-md
                            ${isSidebarCollapsed && !isMobileNavOpen ? 'h-12 flex items-center justify-center' : 'h-14 flex items-center'}
                        `}
                        title="Switch Game"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                            style={{ backgroundImage: currentGame.bgUrl ? `url('${currentGame.bgUrl}')` : 'none' }}
                        ></div>
                        {(!isSidebarCollapsed || isMobileNavOpen) && (
                            <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/90 via-[#121212]/50 to-[#121212]/20 z-10"></div>
                        )}
                        <div className={`relative z-20 w-full flex items-center justify-between px-3 ${isSidebarCollapsed && !isMobileNavOpen ? 'hidden' : ''}`}>
                            <span className="font-bold text-sm text-white truncate drop-shadow-md">{currentGame.name}</span>
                            <svg className="w-4 h-4 text-white/90 drop-shadow-md flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 pb-3 flex flex-col gap-2 overflow-y-auto">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path || pathname === link.path + '/';
                        const displayName = link.dynamicName || link.name;
                        return (
                            <Link
                                key={link.name}
                                href={link.path}
                                title={isSidebarCollapsed ? displayName : ""}
                                onClick={() => setIsMobileNavOpen(false)}
                                className={`
                                    flex items-center rounded-md font-bold text-sm transition-all whitespace-nowrap overflow-hidden
                                    ${isSidebarCollapsed && !isMobileNavOpen ? 'justify-center p-3' : 'px-4 py-3 gap-3'}
                                    ${isActive
                                        ? 'bg-gray-400/20 text-white hover:text-white border border-blue-500'
                                        : 'text-gray-400 hover:bg-[#2a2b30] hover:text-white border border-transparent'}
                                `}
                            >
                                <Image
                                    src={link.icon}
                                    alt={link.name}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 flex-shrink-0"
                                />
                                {(!isSidebarCollapsed || isMobileNavOpen) && <span>{displayName}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Header */}
                <header className="h-16 flex-shrink-0 bg-[#1c1d21] border-b border-[#33343a] flex items-center justify-between px-4 z-30 shadow-sm">

                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            className={`md:hidden ${iconButtonClass}`}
                            onClick={() => setIsMobileNavOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <button
                            className={`hidden md:flex ${iconButtonClass}`}
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            <svg className="cursor-pointer w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <button
                            className={`hidden md:flex ${iconButtonClass}`}
                            onClick={() => setIsGameSwitcherOpen(true)}
                            title={`Switching from ${currentGame.name}`}
                        >
                            <svg className="cursor-pointer w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <SocialButton type="discord" variant="icon" />
                        <SocialButton type="kofi" variant="icon" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col z-10 relative">
                    <SettingsProvider>
                        {children}
                    </SettingsProvider>
                    <Footer />
                </main>
            </div>

            {/* Game Switcher Overlay */}
            {isGameSwitcherOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-[60] transition-all"
                    onClick={() => setIsGameSwitcherOpen(false)}
                />
            )}

            {/* Game Switcher Drawer */}
            <div className={`
                fixed inset-y-0 left-0 z-[70] w-[85%] sm:w-80 bg-[#1c1d21] border-r border-[#33343a] shadow-2xl
                transform transition-transform duration-300 ease-in-out flex flex-col
                ${isGameSwitcherOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-5 border-b border-[#33343a] flex items-center justify-between">
                    <Link href="/" className="text-xl font-black text-white tracking-widest overflow-hidden whitespace-nowrap w-full text-left hover:text-blue-500 transition-colors">
                        SENTI<span className="text-blue-500">.MOE</span>
                    </Link>

                    <button onClick={() => setIsGameSwitcherOpen(false)} className={iconButtonClass}>
                        <svg className="cursor-pointer w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    {GAME_CONFIG.map((game) => (
                        game.status === 'active' ? (
                            <Link
                                key={game.id}
                                href={game.path}
                                onClick={() => setIsGameSwitcherOpen(false)}
                                className="relative group block h-28 rounded-md overflow-hidden border border-[#33343a] hover:border-blue-500 transition-all shadow-md"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: game.bgUrl ? `url('${game.bgUrl}')` : 'none' }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent z-10"></div>
                                <div className="absolute bottom-0 left-0 w-full p-3 z-20">
                                    <h3 className="font-bold text-white transition-colors drop-shadow-lg">
                                        {game.name}
                                    </h3>
                                </div>
                            </Link>
                        ) : (
                            <div
                                key={game.id}
                                className="relative block h-28 rounded-md overflow-hidden border border-[#33343a] opacity-50"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: game.bgUrl ? `url('${game.bgUrl}')` : 'none' }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent z-10"></div>
                                <div className="absolute bottom-0 left-0 w-full p-3 z-20">
                                    <h3 className="font-bold text-white transition-colors drop-shadow-lg">
                                        {game.name}
                                    </h3>
                                    <span className="text-xs text-gray-400">Coming Soon</span>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}