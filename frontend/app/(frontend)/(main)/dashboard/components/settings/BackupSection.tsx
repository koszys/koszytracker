"use client";

import { useRef, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useGame } from "@/contexts/GameContext";
import { DownloadIcon, UploadIcon } from "@/components/common/ui/Icons";
import { useImport } from "@/hooks/useImport";

interface BackupSectionProps {
    setImportModalData: (data: { data: { version: string; exportedAt: string; accounts?: Array<{ name: string; server: string; ar: number; wl: string; gender: string }>; wishes?: Array<unknown> }; isFullBackup: boolean } | null) => void;
    setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function BackupSection({ setImportModalData, setToast }: BackupSectionProps) {
    const { activeGame: game } = useGame();
    const { exportData } = useSettings();
    const { validateImportFile } = useImport();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileChangeKey, setFileChangeKey] = useState(0);

    const handleExportAll = () => {
        try {
            const data = exportData();
            if (!data) {
                setToast({ type: 'error', message: 'Failed to export data.' });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            const jsonStr = JSON.stringify(JSON.parse(data), null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `sentimoe-${game.id}-fullbackup-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setToast({ type: 'success', message: 'Data exported successfully!' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            console.error('Export error:', err);
            setToast({ type: 'error', message: 'Failed to export data.' });
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
            const data = await validateImportFile(file, 'fullBackup');
            setImportModalData({ data, isFullBackup: true });
        } catch (err) {
            const error = err as { message: string };
            setToast({ type: 'error', message: error.message || 'Invalid file format.' });
            setTimeout(() => setToast(null), 3000);
        }

        setFileChangeKey(prev => prev + 1);
    };

    return (
        <div className="bg-[#1c1d21] border border-[#52525b] rounded-xl p-4 md:p-6 shadow-lg mt-8 mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Backup</h3>
            <p className="text-xs text-gray-400 mb-4">For the current game only</p>

            {/* Full Game Backup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#18181b] border border-[#3f3f46] rounded-lg">
                <div>
                    <p className="text-sm font-bold text-white mb-0.5">Full Game Backup</p>
                    <p className="text-xs text-gray-300">Export or import all accounts + wishes (replaces current data).</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleExportAll}
                        className="cursor-pointer px-4 py-2 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    >
                        <span className="flex items-center gap-1.5">
                            <DownloadIcon className="w-4 h-4" />
                            Export All
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={handleImportClick}
                        className="cursor-pointer px-4 py-2 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    >
                        <span className="flex items-center gap-1.5">
                            <UploadIcon className="w-4 h-4" />
                            Import All
                        </span>
                    </button>
                </div>
            </div>

            <input
                key={fileChangeKey}
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}