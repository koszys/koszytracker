"use client";

import { useState, useEffect } from "react";
import SectionHeader from "@/components/common/SectionHeader";
import ConflictModal, { downloadBothConflictFiles } from "@/components/common/ConflictModal";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/app/(main)/auth/components/AuthModal";
import LogoutModal from "@/app/(main)/auth/components/LogoutModal";
import { getGameTerms } from "@/config/gameTerms";
import { useGame } from "@/contexts/GameContext";
import AuthSection from "../components/settings/AuthSection";
import DataManagementSection from "../components/settings/DataManagementSection";
import AccountManagerSection from "../components/settings/AccountManagerSection";
import AccountSettingsSection from "../components/settings/AccountSettingsSection";
import BackupSection from "../components/settings/BackupSection";
import ImportModal from "../components/settings/ImportModal";
import Toast from "../components/settings/Toast";

interface ImportData {
    version: string;
    exportedAt: string;
    accounts?: Array<{
        name: string;
        server: string;
        ar: number;
        wl: string;
        gender: string;
    }>;
    wishes?: Array<unknown>;
}

export default function SettingsPage() {
    const { activeGame: game } = useGame();
    const terms = getGameTerms(game.id);
    const { logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    const {
        importFullBackup, importData,
        conflictData, setConflictData, resolveConflict
    } = useSettings();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [importModalData, setImportModalData] = useState<{ data: ImportData; isFullBackup: boolean } | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleConfirmImport = async () => {
        if (!importModalData) return;

        try {
            const jsonStr = JSON.stringify(importModalData.data);
            let success: boolean;

            if (importModalData.isFullBackup) {
                success = await importFullBackup(jsonStr);
                if (success) {
                    setToast({ type: 'success', message: 'Full backup restored! Remember to sync to cloud manually.' });
                }
            } else {
                success = await importData(jsonStr);
                if (success) {
                    setToast({ type: 'success', message: 'Account imported successfully!' });
                }
            }
            setTimeout(() => setToast(null), 3000);

            if (!success) {
                throw new Error('Import failed');
            }
        } catch (err) {
            console.error('Import error:', err);
            setToast({ type: 'error', message: 'Failed to import data.' });
            setTimeout(() => setToast(null), 3000);
        }

        setImportModalData(null);
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

            <ConflictModal
                isOpen={!!conflictData}
                conflictData={conflictData}
                onResolve={async (resolution) => {
                    await resolveConflict(resolution);
                    setToast({ type: 'success', message: `Data resolved using ${resolution} data` });
                    setTimeout(() => setToast(null), 3000);
                }}
                onDownloadBoth={() => {
                    if (conflictData) {
                        downloadBothConflictFiles(conflictData.localData, conflictData.cloudData, conflictData.type);
                    }
                }}
                onClose={() => setConflictData(null)}
            />

            {/* Import Confirmation Modal */}
            <ImportModal
                isOpen={Boolean(importModalData && mounted)}
                importData={importModalData}
                gameId={game.id}
                terms={terms}
                onConfirm={handleConfirmImport}
                onCancel={() => setImportModalData(null)}
            />

            <div className="space-y-4">

                <AuthSection
                    setShowAuthModal={setShowAuthModal}
                    setShowLogoutModal={setShowLogoutModal}
                />

                <DataManagementSection
                    setToast={setToast}
                />

                <AccountManagerSection
                    setToast={setToast}
                />

                <AccountSettingsSection terms={terms} />

                <BackupSection
                    setImportModalData={setImportModalData}
                    setToast={setToast}
                />

                <Toast toast={toast} />

            </div>
        </div>
    );
}