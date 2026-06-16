"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SocialButton from "./social/SocialButton";

export interface NavLink {
    name: string;
    href: string;
    isActive?: boolean;
}

export function UserNav() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) {
        return (
            <button
                onClick={() => router.push("/account")}
                className="ml-2 px-5 py-2 bg-theme border border-transparent hover:bg-transparent hover:border-theme text-white rounded text-sm font-bold transition-colors shadow-md cursor-pointer"
            >
                Sign In
            </button>
        );
    }

    return (
        <div className="relative z-50 ml-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
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
                <svg className={`w-4 h-4 text-theme transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-[#1c1d21] border border-[#33343a] hover:border-theme rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
                        <Link
                            href="/account/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-200 hover:text-white hover:bg-[#24252a] transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Site Account
                        </Link>
                        <button
                            onClick={() => { setIsOpen(false); logout(); }}
                            className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-[#24252a] transition-colors text-left w-full cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

interface HeaderProps {
    navLinks?: NavLink[];
    scrolled?: boolean;
}

export default function Header({ navLinks, scrolled = false }: HeaderProps) {
    return (
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
                {navLinks && navLinks.length > 0 && (
                    <nav className="hidden md:flex space-x-6 text-sm font-semibold">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`${link.isActive ? "text-white border-b-2 border-theme pb-1" : "text-gray-300 hover:text-white pb-1"}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>

            <div className="flex items-center space-x-4">
                <div className="hidden sm:flex">
                    <SocialButton type="discord" variant="full" />
                </div>
                <div className="hidden sm:flex">
                    <SocialButton type="kofi" variant="full" />
                </div>
                <UserNav />
            </div>
        </header>
    );
}
