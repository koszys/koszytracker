"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/common/Header";

export default function AccountSettingsPage() {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return (
            <div className="min-h-screen bg-[#121212] text-gray-300 font-sans relative">
                <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
                    style={{ backgroundImage: "url('/assets/sentihappy.webp')" }}
                />
                <div className="relative z-10">
                <Header navLinks={[{ name: "Home", href: "/" }]} />
                <main className="max-w-100 mx-auto p-4 md:p-6 min-h-[80vh] flex items-center justify-center">
                    <div className="bg-[#1c1d21]/60 border border-[#52525b] p-8 rounded-2xl w-full text-center">
                        <h2 className="text-xl font-bold text-white mb-4">Not signed in</h2>
                        <p className="text-sm text-gray-300 mb-6">Sign in to view your account settings.</p>
                        <Link
                            href="/account"
                            className="inline-block px-5 py-2 bg-theme text-white rounded text-sm font-bold hover:brightness-110 transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-gray-300 font-sans selection:bg-theme/50 selection:text-white relative">
            <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
                style={{ backgroundImage: "url('/assets/sentihappy.webp')" }}
            />
            <div className="relative z-10">
            <Header navLinks={[{ name: "Home", href: "/" }]} />
            <main className="max-w-150 mx-auto p-4 md:p-6 mt-12">
                <h1 className="text-2xl font-bold text-white mb-6 tracking-wide">Account Settings</h1>

                {/* Profile Section */}
                <div className="bg-[#1c1d21]/60 border border-[#52525b] rounded-xl p-6 shadow-lg mb-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-5">Profile</h3>

                    <div className="flex items-center gap-4 mb-6">
                        {user.avatar || user.picture ? (
                            <img
                                src={user.avatar || user.picture}
                                alt="Profile"
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-full object-cover border border-[#52525b]"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-theme flex items-center justify-center text-xl font-bold text-white">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                        )}
                        <div>
                            <p className="text-base font-bold text-white">{user.name}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                    </div>

                    {user.identities && user.identities.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-300 uppercase tracking-wider mb-2 font-medium">Connected</p>
                            <div className="flex items-center gap-2">
                                {user.identities.map((identity) => {
                                    if (identity.provider === 'google') {
                                        return (
                                            <div key="google" title="Google Connected" className="flex items-center gap-1.5 p-2 px-3 rounded-full border border-[#52525b] bg-[#18181b]">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                </svg>
                                                <span className="text-xs text-gray-300 font-medium">Google</span>
                                            </div>
                                        );
                                    }
                                    if (identity.provider === 'discord') {
                                        return (
                                            <div key="discord" title="Discord Connected" className="flex items-center gap-1.5 p-2 px-3 rounded-full border border-[#52525b] bg-[#18181b]">
                                                <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 127.14 96.36">
                                                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                                                </svg>
                                                <span className="text-xs text-gray-300 font-medium">Discord</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            </div>
        </div>
    );
}
