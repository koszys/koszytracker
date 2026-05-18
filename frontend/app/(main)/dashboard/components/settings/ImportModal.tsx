"use client";

import { createPortal } from "react-dom";

interface ImportModalProps {
    isOpen: boolean;
    importData: {
        data: {
            version: string;
            exportedAt: string;
            gameId?: string;
            accounts?: Array<{
                name: string;
                server: string;
                ar: number;
                wl: string;
                gender: string;
            }>;
            wishes?: Array<unknown>;
        };
        isFullBackup: boolean;
    } | null;
    gameId: string;
    terms: {
        ar: string;
        wl: string;
    };
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ImportModal({ isOpen, importData, gameId, terms, onConfirm, onCancel }: ImportModalProps) {
    if (!isOpen || !importData) return null;

    const isFullBackup = importData.isFullBackup;
    const data = importData.data;
    const isWrongGame = data.gameId && data.gameId !== gameId;

    const content = (
        <div className="fixed inset-0 bg-[#09090b]/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#18181b] border border-white/10 p-6 rounded-xl max-w-sm w-full shadow-2xl">
                {isWrongGame ? (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Wrong Game</h3>
                                <p className="text-gray-400 text-sm">This account is for a different game</p>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-6">
                            This backup is for <span className="text-white font-bold">{data.gameId}</span> but you are currently on <span className="text-white font-bold">{gameId}</span>.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="cursor-pointer px-4 py-2 text-gray-400 hover:text-white hover:border-theme transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : isFullBackup ? (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Full Backup Restore</h3>
                                <p className="text-gray-400 text-sm">This will replace all your data</p>
                            </div>
                        </div>
                        <p className="text-sm text-yellow-400 mb-4">
                            ⚠️ This will replace ALL accounts and wish history with the backup data.
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                            This action cannot be undone.
                        </p>
                        <div className="bg-white/5 rounded-lg p-3 mb-6 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Backup contains</p>
                            <p className="text-sm text-white font-bold">
                                {data.accounts?.length || 0} accounts, {data.wishes?.length || 0} wishes
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="cursor-pointer px-4 py-2 text-gray-400 hover:text-white hover:border-theme transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-theme-from to-theme-to hover:brightness-110 text-white border border-theme px-5 py-2 rounded-lg font-bold transition-all shadow-[0_0_10px_var(--theme-glow)]"
                            >
                                Replace & Import
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-theme/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-theme" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Import Account</h3>
                                <p className="text-gray-400 text-sm">Add a new account to your list</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            This will add <span className="text-white font-bold">{data.accounts?.[0]?.name || 'the account'}</span> as a new account.
                        </p>
                        <div className="bg-white/5 rounded-lg p-3 mb-6 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Account Name</p>
                            <p className="text-sm text-white font-bold">{data.accounts?.[0]?.name}</p>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-gray-500">{terms.ar} / {terms.wl}</p>
                                    <p className="text-white">{data.accounts?.[0]?.ar} / {data.accounts?.[0]?.wl}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Server</p>
                                    <p className="text-white">{data.accounts?.[0]?.server}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="cursor-pointer px-4 py-2 text-gray-400 hover:text-white hover:border-theme transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-theme-from to-theme-to hover:brightness-110 text-white border border-theme px-5 py-2 rounded-lg font-bold transition-all shadow-[0_0_10px_var(--theme-glow)]"
                            >
                                Import
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    if (typeof window === 'undefined') return null;
    return createPortal(content, document.body);
}