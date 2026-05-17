"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import SectionHeader from "@/components/common/SectionHeader";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/app/(main)/auth/components/AuthModal";
import LogoutModal from "@/app/(main)/auth/components/LogoutModal";
import { getGameTerms } from "@/config/gameTerms";
import { useGame } from "@/contexts/GameContext";

interface ImportData {
    version: string;
    exportedAt: string;
    account: {
        name: string;
        server: string;
        ar: number;
        wl: string;
        gender: string;
    };
}

export default function SettingsPage() {
    const { activeGame: game } = useGame();
    const terms = getGameTerms(game.id);
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    const {
        accounts, activeAccountId, setActiveAccountId, activeAccount,
        addAccount, updateActiveAccount, deleteActiveAccount,
        exportAccount, importAccount
    } = useSettings();

    const [isRenaming, setIsRenaming] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [importModalData, setImportModalData] = useState<{ data: ImportData } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleExportAccount = () => {
        try {
            const data = exportAccount();
            if (!data) {
                setToast({ type: 'error', message: 'Failed to export account.' });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            const jsonStr = JSON.stringify(JSON.parse(data), null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            a.href = url;
            const fileName = activeAccount?.name.replace(/\s+/g, '-').toLowerCase() || 'account';
            a.download = `koszy-${fileName}-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setToast({ type: 'success', message: 'Account exported successfully!' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            console.error('Export error:', err);
            setToast({ type: 'error', message: 'Failed to export account.' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.account || !data.version) {
                throw new Error('Invalid format');
            }

            setImportModalData({ data });
        } catch (err) {
            console.error('Import parse error:', err);
            setToast({ type: 'error', message: 'Invalid file format.' });
            setTimeout(() => setToast(null), 3000);
        }

        e.target.value = '';
    };

    const handleConfirmImport = () => {
        if (!importModalData) return;

        try {
            const success = importAccount(JSON.stringify(importModalData.data));
            if (success) {
                setToast({ type: 'success', message: 'Account imported successfully!' });
                setTimeout(() => setToast(null), 3000);
            } else {
                throw new Error('Import failed');
            }
        } catch (err) {
            console.error('Import error:', err);
            setToast({ type: 'error', message: 'Failed to import account.' });
            setTimeout(() => setToast(null), 3000);
        }

        setImportModalData(null);
    };

    const handleSyncClick = () => {
        setIsSyncing(true);
        // Simulate sync
        setTimeout(() => {
            setIsSyncing(false);
            setCooldown(30);
            setToast({ type: 'success', message: 'Data synced to cloud successfully!' });
            setTimeout(() => setToast(null), 3000);
        }, 2000);
    };

    const handleRenameSubmit = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') setIsRenaming(false);
    };

    const confirmDelete = () => {
        deleteActiveAccount();
        setShowDeleteModal(false);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        setToast({ type: 'success', message: 'Signed out successfully!' });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="w-full max-w-[1000px] mx-auto pb-20 px-4 md:px-0">
            <SectionHeader title="Settings" />

            {/* Modals */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <LogoutModal isOpen={showLogoutModal} onCancel={() => setShowLogoutModal(false)} onConfirm={confirmLogout} />

            {/* Delete Modal */}
            {showDeleteModal && mounted && createPortal(
                <div className="fixed inset-0 bg-[#09090b]/90 z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#18181b] border border-white/10 p-6 rounded-xl max-w-sm w-full shadow-2xl">
                        <h3 className="text-white font-bold text-lg mb-6">Are you sure you want to delete this account?</h3>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white hover:border-theme transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex items-center gap-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-900/50 hover:border-red-500 px-5 py-2 rounded-lg font-bold transition-colors shadow-md"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Import Confirmation Modal */}
            {importModalData && mounted && createPortal(
                <div className="fixed inset-0 bg-[#09090b]/90 z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#18181b] border border-white/10 p-6 rounded-xl max-w-sm w-full shadow-2xl">
                        <h3 className="text-white font-bold text-lg mb-2">Import Account Data</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            This will add <span className="text-white font-bold">{importModalData.data.account.name}</span> as a new account.
                        </p>
                        <div className="bg-white/5 rounded-lg p-3 mb-6 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Account Name</p>
                            <p className="text-sm text-white font-bold">{importModalData.data.account.name}</p>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-gray-500">{terms.ar} / {terms.wl}</p>
                                    <p className="text-white">{importModalData.data.account.ar} / {importModalData.data.account.wl}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Server</p>
                                    <p className="text-white">{importModalData.data.account.server}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setImportModalData(null)}
                                className="px-4 py-2 text-gray-400 hover:text-white hover:border-theme transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-theme-from to-theme-to hover:brightness-110 text-white border border-theme px-5 py-2 rounded-lg font-bold transition-all shadow-[0_0_10px_var(--theme-glow)]"
                            >
                                Import
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <div className="space-y-4">

                {/* Auth Account Block */}
                <div className="bg-[#1c1d21] border border-[#52525b] rounded-xl p-4 md:p-6 shadow-lg mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Site Account</h3>
                        
                        {user && user.identities && (
                            <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-full border border-[#52525b] bg-[#1c1d21]/50 text-xs text-gray-400 font-medium">
                                <span className="text-[10px] text-gray-500 mr-0.5">Connected:</span>
                                
                                {user.identities.map((identity) => {
                                    // Google Icon
                                    if (identity.provider === 'google') {
                                        return (
                                            <div key="google" title="Google Connected" className="flex items-center justify-center p-0.5">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                </svg>
                                            </div>
                                        );
                                    }
                                    
                                    // Discord Icon
                                    if (identity.provider === 'discord') {
                                        return (
                                            <div key="discord" title="Discord Connected" className="flex items-center justify-center p-0.5">
                                                <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 127.14 96.36">
                                                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                                                </svg>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>

                    {user ? (
                        // Logged in state
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-[#18181b] border border-[#3f3f46] rounded-lg">
                            <div className="flex items-center gap-3">
                                {user.avatar ? (
                                    <Image src={user.avatar} alt="Profile" width={40} height={40} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-[#52525b]" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-theme-from to-theme-to">
                                        {user.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold text-white">{user.name}</p>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                            </div>
                            {/* Sign Out Button */}
                            <button onClick={() => setShowLogoutModal(true)} className="px-4 py-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-900/50 hover:border-red-500 rounded-lg text-sm font-bold transition-colors w-max shadow-md">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        // Logged out state
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-[#18181b] border border-[#3f3f46] rounded-lg">
                            <div>
                                <p className="text-sm font-bold text-white mb-1">You are not signed in.</p>
                                <p className="text-xs text-gray-300">Sign in to automatically save and sync your data.</p>
                            </div>
                            <button onClick={() => setShowAuthModal(true)} className="px-6 py-2 bg-theme hover:brightness-110 border border-transparent hover:border-white text-white rounded-lg text-sm font-bold transition-all w-full sm:w-auto cursor-pointer">
                                Sign In
                            </button>
                        </div>
                    )}
                </div>

                {/* Data Management Section */}
                <div className="bg-[#1c1d21] border border-[#52525b] rounded-xl p-4 md:p-6 shadow-lg mb-8">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Data Management</h3>
                    <div className="flex flex-col gap-3">
                        
                        {/* Manual Sync Block */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#18181b] border border-[#3f3f46] rounded-lg">
                            <div>
                                <p className="text-sm font-bold text-white mb-0.5">Sync Local Data to Cloud</p>
                                <p className="text-xs text-gray-300">Merge any un-synced data from this browser into your cloud account.</p>
                            </div>

                            <button 
                                type="button"
                                onClick={handleSyncClick}
                                disabled={!user || isSyncing || cooldown > 0} 
                                className="cursor-pointer px-4 py-2 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white disabled:opacity-50 disabled:hover:border-[#52525b] disabled:hover:text-gray-300 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-w-[120px]"
                            >
                                {isSyncing 
                                    ? 'Syncing...' 
                                    : cooldown > 0 
                                        ? `Synced (${cooldown}s)` 
                                        : 'Sync to Cloud'
                                }
                            </button>
                            
                        </div>
                    </div>
                </div>

                {/* Account Manager */}
                <div className="bg-[#1c1d21] border border-[#52525b] rounded-xl p-4 md:p-6 shadow-lg mb-8">
                    <p className="text-sm text-gray-300 mb-1">More than one account? Add it here.</p>
                    <p className="text-sm font-bold text-white mb-4">Importing will add the account to your list.</p>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={addAccount}
                                className="cursor-pointer flex items-center gap-1.5 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add
                            </button>

                            <select
                                value={activeAccountId}
                                onChange={(e) => setActiveAccountId(e.target.value)}
                                className="bg-[#18181b] border border-[#52525b] text-white text-sm rounded-md px-3 py-1.5 min-w-[120px] focus:outline-none focus:border-theme/50 focus:ring-1 focus:ring-theme/50 appearance-none transition-all"
                            >
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setIsRenaming(!isRenaming)}
                                className="cursor-pointer flex items-center gap-1.5 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Rename
                            </button>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                disabled={accounts.length === 1}
                                className="flex items-center gap-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-900/50 hover:border-red-500 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Delete
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={handleExportAccount} className="cursor-pointer bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Export Account</button>
                            <button onClick={handleImportClick} className="cursor-pointer bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Import Account</button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Rename Input */}
                    {isRenaming && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={activeAccount?.name || ''}
                                onChange={(e) => updateActiveAccount('name', e.target.value)}
                                onKeyDown={handleRenameSubmit}
                                className="bg-[#18181b] border border-theme/50 text-white text-sm rounded-md px-3 py-1.5 w-full max-w-[256px] focus:outline-none focus:ring-1 focus:ring-theme/50 transition-all"
                            />
                            <button onClick={() => setIsRenaming(false)} className="text-sm px-2 py-1.5 text-theme hover:brightness-110 hover:border-theme font-bold">Save</button>
                        </div>
                    )}
                </div>

                {/* Account Settings */}
                <div className="bg-[#1c1d21] border border-[#52525b] rounded-xl p-4 md:p-6 shadow-lg">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Account Settings</h3>
                    <div className="flex flex-wrap items-end gap-4 md:gap-6">

                        {/* Account Level */}
                        <div className="flex flex-col gap-1.5">
                            <div className="relative group/tooltip w-max">
                                <label className="text-xs text-gray-400 font-bold uppercase border-b border-dashed border-gray-500 cursor-help">
                                    {terms.ar}
                                </label>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#27272a] border border-[#52525b] text-white text-[10px] md:text-xs font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                    {terms.arFull}
                                </div>
                            </div>
                            <input 
                                type="number" 
                                min="1"
                                max={terms.maxAr}
                                value={activeAccount?.ar || ''}
                                onChange={(e) => {
                                    let val: number | string = parseInt(e.target.value, 10);
                                    if (isNaN(val)) val = '';
                                    else if (val > terms.maxAr) val = terms.maxAr;
                                    else if (val < 1) val = 1;
                                    updateActiveAccount('ar', val);
                                }}
                                onBlur={() => {
                                    if (!activeAccount?.ar || (typeof activeAccount?.ar === 'number' && activeAccount.ar < 1)) {
                                        updateActiveAccount('ar', 1);
                                    }
                                }}
                                className="bg-[#18181b] border border-[#52525b] text-white text-sm rounded-lg px-3 py-2 w-20 focus:outline-none focus:border-theme/50 focus:ring-1 focus:ring-theme/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                        </div>

                        {/* World Level */}
                        <div className="flex flex-col gap-1.5">
                            <div className="relative group/tooltip w-max">
                                <label className="text-xs text-gray-400 font-bold uppercase border-b border-dashed border-gray-500 cursor-help">
                                    {terms.wl}
                                </label>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#27272a] border border-[#52525b] text-white text-[10px] md:text-xs font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                    {terms.wlFull}
                                </div>
                            </div>
                            <select
                                value={activeAccount?.wl || '0'}
                                onChange={(e) => updateActiveAccount('wl', e.target.value)}
                                className="bg-[#18181b] border border-[#52525b] text-white text-sm rounded-lg px-3 py-2 min-w-[5rem] focus:outline-none focus:border-theme/50 focus:ring-1 focus:ring-theme/50 transition-all appearance-none"
                            >
                                {terms.wlOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Account Server */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-400 font-bold top-1">Server</label>
                            <select
                                value={activeAccount?.server || 'America'}
                                onChange={(e) => updateActiveAccount('server', e.target.value)}
                                className="bg-[#18181b] border border-[#52525b] text-white text-sm rounded-lg px-3 py-2 w-32 focus:outline-none focus:border-theme/50 focus:ring-1 focus:ring-theme/50 transition-all"
                            >
                                <option value="America">America</option>
                                <option value="Europe">Europe</option>
                                <option value="Asia">Asia</option>
                            </select>
                        </div>

                        {/* Dynamic Main Character Toggle */}
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                            <label className="text-xs text-gray-400 font-bold">{terms.mcTitle}</label>
                            <div className="flex items-center bg-[#18181b] border border-[#52525b] rounded-lg h-[38px]">
                                <button
                                    onClick={() => updateActiveAccount('gender', 'M')}
                                    className={`flex-1 h-full px-3 flex items-center justify-center text-xs font-bold transition-colors border border-transparent hover:border-theme cursor-pointer rounded-l-lg relative hover:z-10 ${activeAccount?.gender === 'M' ? 'bg-theme/30 text-white' : 'text-white hover:bg-[#24252a]'}`}
                                >
                                    {terms.mcMale}
                                </button>
                                <div className="w-[1px] h-full bg-[#52525b]"></div>
                                <button
                                    onClick={() => updateActiveAccount('gender', 'F')}
                                    className={`flex-1 h-full px-3 flex items-center justify-center text-xs font-bold transition-colors border border-transparent hover:border-theme cursor-pointer rounded-r-lg relative hover:z-10 ${activeAccount?.gender === 'F' ? 'bg-theme/30 text-white' : 'text-white hover:bg-[#24252a]'}`}
                                >
                                    {terms.mcFemale}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl text-sm font-bold z-[200] flex items-center gap-2 transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600/90 border border-green-500 text-white' : 'bg-red-600/90 border border-red-500 text-white'}`}>
                    {toast.type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    {toast.message}
                </div>
            )}

        </div>
    );
}
