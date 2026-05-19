"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { useGame } from "@/contexts/GameContext";

interface ImportError {
    message: string;
}

export interface ValidatedImportData {
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
}

export function useImport() {
    const { importData, importFullBackup } = useSettings();
    const { activeGame: game } = useGame();

    const validateImportFile = async (file: File, importType: 'fullBackup' | 'singleAccount'): Promise<ValidatedImportData> => {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.version) {
            throw { message: 'Invalid backup: missing version.' } as ImportError;
        }

        if (!data.gameId) {
            throw { message: 'Invalid backup: missing gameId. This may be from a different game.' } as ImportError;
        }

        if (data.gameId !== game.id) {
            throw { message: `This backup is for ${data.gameId}, not ${game.id}.` } as ImportError;
        }

        if (!data.accounts || !Array.isArray(data.accounts)) {
            throw { message: 'Invalid backup: missing accounts.' } as ImportError;
        }

        const fileName = file.name.toLowerCase();

        if (importType === 'fullBackup') {
            if (!fileName.includes('backup')) {
                throw { message: 'Please use a full backup file.' } as ImportError;
            }
        } else {
            const requiredFields = ['name', 'server', 'ar', 'wl', 'gender'];
            for (const account of data.accounts) {
                for (const field of requiredFields) {
                    if (account[field] === undefined) {
                        throw { message: `Invalid account: missing ${field}.` } as ImportError;
                    }
                }
            }
            if (fileName.includes('backup')) {
                throw { message: 'Please use an account export file, not a full backup.' } as ImportError;
            }
        }

        return data;
    };

    const importFullBackupFromFile = async (
        file: File,
        setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void,
        onSuccess?: () => void
    ) => {
        try {
            const data = await validateImportFile(file, 'fullBackup');
            const success = await importFullBackup(JSON.stringify(data));
            if (success) {
                setToast({ type: 'success', message: 'Data imported successfully!' });
                setTimeout(() => setToast(null), 3000);
                onSuccess?.();
            } else {
                setToast({ type: 'error', message: 'Import failed.' });
                setTimeout(() => setToast(null), 3000);
            }
        } catch (err) {
            const error = err as ImportError;
            setToast({ type: 'error', message: error.message || 'Invalid file format.' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const importSingleAccountFromFile = async (
        file: File,
        setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void,
        onSuccess?: () => void
    ) => {
        try {
            const data = await validateImportFile(file, 'singleAccount');
            const success = await importData(JSON.stringify(data));
            if (success) {
                setToast({ type: 'success', message: 'Account imported successfully!' });
                setTimeout(() => setToast(null), 3000);
                onSuccess?.();
            } else {
                setToast({ type: 'error', message: 'Import failed.' });
                setTimeout(() => setToast(null), 3000);
            }
        } catch (err) {
            const error = err as ImportError;
            setToast({ type: 'error', message: error.message || 'Invalid file format.' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    return {
        validateImportFile,
        importFullBackupFromFile,
        importSingleAccountFromFile,
    };
}