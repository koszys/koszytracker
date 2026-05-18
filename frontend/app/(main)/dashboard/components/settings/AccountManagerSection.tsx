"use client";

import { useRef, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useGame } from "@/contexts/GameContext";
import DeleteModal from "./DeleteModal";

interface AccountManagerSectionProps {
    setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function AccountManagerSection({ setToast }: AccountManagerSectionProps) {
    const { activeGame: game } = useGame();
    const { accounts, activeAccountId, setActiveAccountId, activeAccount, addAccount, updateActiveAccount, deleteActiveAccount, importData } = useSettings();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [accountImportKey, setAccountImportKey] = useState(0);

    const handleRenameSubmit = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') setIsRenaming(false);
    };

    const confirmDelete = () => {
        deleteActiveAccount();
        setShowDeleteModal(false);
    };

    const handleSingleAccountExport = () => {
        const acc = activeAccount;
        if (!acc) {
            setToast({ type: 'error', message: 'No active account to export.' });
            setTimeout(() => setToast(null), 3000);
            return;
        }
        const exportPayload = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            source: 'local',
            gameId: game.id,
            accounts: [{
                name: acc.name,
                server: acc.server,
                ar: acc.ar,
                wl: acc.wl,
                gender: acc.gender,
            }],
            wishes: [],
        };
        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sentimoe-${game.id}-${acc.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setToast({ type: 'success', message: 'Account exported successfully!' });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSingleAccountImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.version) {
                setToast({ type: 'error', message: 'Invalid file: missing version.' });
                setTimeout(() => setToast(null), 3000);
                setAccountImportKey(prev => prev + 1);
                return;
            }

            if (!data.accounts || !Array.isArray(data.accounts) || data.accounts.length === 0) {
                setToast({ type: 'error', message: 'Invalid file: missing accounts.' });
                setTimeout(() => setToast(null), 3000);
                setAccountImportKey(prev => prev + 1);
                return;
            }

            if (!data.gameId) {
                setToast({ type: 'error', message: 'Invalid file: missing gameId. This may be from a different game.' });
                setTimeout(() => setToast(null), 3000);
                setAccountImportKey(prev => prev + 1);
                return;
            }

            if (data.gameId !== game.id) {
                setToast({ type: 'error', message: `This account is for ${data.gameId}, not ${game.id}.` });
                setTimeout(() => setToast(null), 3000);
                setAccountImportKey(prev => prev + 1);
                return;
            }

            const requiredFields = ['name', 'server', 'ar', 'wl', 'gender'];
            for (const account of data.accounts) {
                for (const field of requiredFields) {
                    if (account[field] === undefined) {
                        setToast({ type: 'error', message: `Invalid account: missing ${field}.` });
                        setTimeout(() => setToast(null), 3000);
                        setAccountImportKey(prev => prev + 1);
                        return;
                    }
                }
            }

            const fileName = file.name.toLowerCase();
            if (fileName.includes('backup')) {
                setToast({ type: 'error', message: 'Please use an account export file, not a full backup.' });
                setTimeout(() => setToast(null), 3000);
                setAccountImportKey(prev => prev + 1);
                return;
            }

            const success = await importData(JSON.stringify(data));
            if (success) {
                setToast({ type: 'success', message: 'Account imported successfully!' });
                setTimeout(() => setToast(null), 3000);
            } else {
                setToast({ type: 'error', message: 'Import failed.' });
                setTimeout(() => setToast(null), 3000);
            }
            setAccountImportKey(prev => prev + 1);
        } catch (err) {
            console.error('Import error:', err);
            setToast({ type: 'error', message: 'Failed to import account.' });
            setTimeout(() => setToast(null), 3000);
            setAccountImportKey(prev => prev + 1);
        }
    };

    return (
        <div className="bg-[#1c1d21] border border-[#52525b] rounded-xl p-4 md:p-6 shadow-lg mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Accounts</h3>

            <p className="text-sm text-gray-300 mb-3">More than one account? Add it here.</p>

            <DeleteModal
                isOpen={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />

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
                        className="cursor-pointer flex items-center gap-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-900/50 hover:border-red-500 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleSingleAccountExport}
                        disabled={!activeAccount}
                        className="cursor-pointer flex items-center gap-1.5 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer flex items-center gap-1.5 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Import
                    </button>
                    <input
                        key={accountImportKey}
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleSingleAccountImport}
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
    );
}