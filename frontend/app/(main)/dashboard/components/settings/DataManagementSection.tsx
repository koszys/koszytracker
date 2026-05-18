"use client";

import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";

interface DataManagementSectionProps {
    setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function DataManagementSection({ setToast }: DataManagementSectionProps) {
    const { user } = useAuth();
    const { importLocalAccounts, syncAccounts, lastSyncedAt } = useSettings();
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveToCloud = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const result = await syncAccounts();
            if (result === true) {
                setToast({ type: 'success', message: 'Data saved to cloud!' });
            } else {
                setToast({ type: 'error', message: 'Failed to save data' });
            }
        } catch (err) {
            console.error(err);
            setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    return (
        <div className="bg-[#1c1d21] border border-[#52525b] rounded-xl p-4 md:p-6 shadow-lg mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Data Management</h3>
            <div className="flex flex-col gap-3">

                {/* Cloud Sync */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#18181b] border border-[#3f3f46] rounded-lg">
                    <div>
                        <p className="text-sm font-bold text-white mb-0.5">Cloud Sync</p>
                        <p className="text-xs text-gray-300">Save your account data to our database.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSaveToCloud}
                        disabled={!user || isSaving}
                        className="cursor-pointer px-4 py-2 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white disabled:text-gray-500 disabled:border-[#52525b]/50 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-w-[140px]"
                    >
                        {!user ? 'Sign in to Save' : (isSaving ? 'Saving...' : 'Save to Cloud')}
                    </button>
                </div>

                {/* Import Local Data */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#18181b] border border-[#3f3f46] rounded-lg">
                    <div>
                        <p className="text-sm font-bold text-white mb-0.5">Import Local Data</p>
                        <p className="text-xs text-gray-300">Import your local accounts from before login.</p>
                    </div>
                    <button
                        type="button"
                        onClick={importLocalAccounts}
                        disabled={!user}
                        className="cursor-pointer px-4 py-2 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white disabled:opacity-50 disabled:hover:border-[#52525b] disabled:hover:text-gray-300 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-w-[140px]"
                    >
                        Import
                    </button>
                </div>

                {/* Sync Status */}
                <div className="p-4 bg-[#18181b] border border-[#3f3f46] rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-sm">
                            <span className="text-gray-300">Sync Status: </span>
                            <span className={lastSyncedAt ? 'text-green-400' : 'text-yellow-400'}>
                                {lastSyncedAt ? 'Synced' : 'Not Synced'}
                            </span>
                        </div>
                        {lastSyncedAt && (
                            <div className="text-xs text-gray-400">
                                Last Sync: {lastSyncedAt.toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}