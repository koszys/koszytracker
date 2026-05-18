"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useGame } from "./GameContext";

export interface GameAccount {
    id: string;
    name: string;
    server: string;
    ar: number;
    wl: string;
    gender: string;
}

interface ConflictData {
    type: "accounts" | "wishes";
    localCount: number;
    cloudCount: number;
    localModifiedAt: Date | null;
    cloudModifiedAt: Date | null;
    localData: any[];
    cloudData: any[];
}

interface SettingsContextValue {
    accounts: GameAccount[];
    activeAccountId: string;
    setActiveAccountId: (id: string) => void;
    activeAccount: GameAccount | undefined;
    addAccount: () => void;
    updateActiveAccount: (key: keyof GameAccount, value: string | number) => void;
    deleteActiveAccount: () => void;
    exportData: () => string | null;
    importData: (jsonData: string) => Promise<boolean>;
    importFullBackup: (jsonData: string) => Promise<boolean>;
    importLocalAccounts: () => void;
    lastSyncedAt: Date | null;
    syncAccounts: () => Promise<boolean>;
    conflictData: ConflictData | null;
    setConflictData: (data: ConflictData | null) => void;
    resolveConflict: (resolution: "local" | "cloud" | "merge") => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEYS = {
    accounts: 'wish-tracker-accounts',
    activeAccount: 'wish-tracker-active-account',
    localBackup: 'wish-tracker-local-backup',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function SettingsProvider({ children }: { children: ReactNode }) {
    const { user, getToken } = useAuth();
    const { activeGame } = useGame();

    const [accounts, setAccounts] = useState<GameAccount[]>([]);
    const [activeAccountId, setActiveAccountId] = useState('account_1');
    const [loaded, setLoaded] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
    const [conflictData, setConflictData] = useState<ConflictData | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    const createDefaultAccount = (): GameAccount => ({
        id: 'account_1',
        name: 'Main',
        server: 'America',
        ar: 60,
        wl: '8',
        gender: 'M',
    });

    const loadFromLocalStorage = useCallback((gameId: string) => {
        const storageKey = `${STORAGE_KEYS.accounts}_${gameId}`;
        const storedAccounts = localStorage.getItem(storageKey);
        if (storedAccounts) {
            try {
                return JSON.parse(storedAccounts);
            } catch {
                return [createDefaultAccount()];
            }
        }
        return [createDefaultAccount()];
    }, []);

    const saveToLocalStorage = useCallback((gameId: string, accs: GameAccount[]) => {
        const storageKey = `${STORAGE_KEYS.accounts}_${gameId}`;
        localStorage.setItem(storageKey, JSON.stringify(accs));
    }, []);

    const fetchFromApi = useCallback(async (gameId: string) => {
        const token = getToken();
        if (!token) return { accounts: null, lastSyncedAt: null };

        try {
            const res = await fetch(`${API_BASE}/api/accounts?game_id=${gameId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const accounts = data.map((acc: any) => ({
                    id: `db_${acc.id}`,
                    name: acc.name,
                    server: acc.server,
                    ar: acc.ar,
                    wl: acc.wl,
                    gender: acc.mc_option || 'M',
                }));

                let lastSynced: Date | null = null;
                if (data.length > 0) {
                    const timestamps = data
                        .filter((acc: any) => acc.last_synced_at)
                        .map((acc: any) => new Date(acc.last_synced_at).getTime());
                    if (timestamps.length > 0) {
                        lastSynced = new Date(Math.max(...timestamps));
                    }
                }

                return { accounts, lastSyncedAt: lastSynced };
            }
        } catch (err) {
            console.error('Failed to fetch accounts:', err);
        }
        return { accounts: null, lastSyncedAt: null };
    }, [getToken]);

    const syncToApi = useCallback(async (gameId: string, accs: GameAccount[]) => {
        const token = getToken();
        if (!token) return false;

        try {
            const accountsData = accs.map(acc => ({
                game_id: gameId,
                uid: acc.id.startsWith('db_') ? acc.id.replace('db_', '') : null,
                name: acc.name,
                server: acc.server,
                ar: acc.ar,
                wl: acc.wl,
                mc_option: acc.gender,
            }));

            const res = await fetch(`${API_BASE}/api/accounts/sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ game_id: gameId, accounts: accountsData })
            });
            return res.ok;
        } catch (err) {
            console.error('Failed to sync accounts:', err);
            return false;
        }
    }, [getToken]);

    const checkAccountsConflict = useCallback(async (localAccs: GameAccount[]) => {
        const token = getToken();
        if (!token) return null;

        try {
            const accountsData = localAccs.map(acc => ({
                game_id: activeGame.id,
                uid: acc.id.startsWith('db_') ? acc.id.replace('db_', '') : null,
                name: acc.name,
                server: acc.server,
                ar: acc.ar,
                wl: acc.wl,
                mc_option: acc.gender,
            }));

            const res = await fetch(`${API_BASE}/api/accounts/check-conflict`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ game_id: activeGame.id, accounts: accountsData })
            });

            if (!res.ok) {
                return null;
            }

            const data = await res.json();
            if (data.has_conflict) {
                return {
                    type: "accounts" as const,
                    localCount: localAccs.length,
                    cloudCount: data.cloud_accounts?.length || 0,
                    localModifiedAt: data.local_modified_at ? new Date(data.local_modified_at) : null,
                    cloudModifiedAt: data.cloud_modified_at ? new Date(data.cloud_modified_at) : null,
                    localData: localAccs,
                    cloudData: data.cloud_accounts || [],
                };
            }
        } catch (err) {
            console.error('Failed to check conflict:', err);
            return null;
        }
        return null;
    }, [getToken, activeGame.id]);

    const resolveConflict = useCallback(async (resolution: "local" | "cloud" | "merge") => {
        if (!conflictData || isResolving) return;
        setIsResolving(true);

        try {
            const token = getToken();
            if (!token || conflictData.type !== "accounts") {
                setIsResolving(false);
                return;
            }

            const localData = conflictData.localData.map((acc: any) => ({
                game_id: activeGame.id,
                uid: acc.id.startsWith('db_') ? acc.id.replace('db_', '') : null,
                name: acc.name,
                server: acc.server,
                ar: acc.ar,
                wl: acc.wl,
                mc_option: acc.gender,
            }));

            const res = await fetch(`${API_BASE}/api/accounts/resolve-conflict`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game_id: activeGame.id,
                    resolution: resolution,
                    local_accounts: localData,
                    cloud_accounts: conflictData.cloudData
                })
            });

            if (!res.ok) {
                setIsResolving(false);
                return;
            }

            const data = await res.json();
            const updatedAccounts = data.accounts.map((acc: any) => ({
                id: `db_${acc.id}`,
                name: acc.name,
                server: acc.server,
                ar: acc.ar,
                wl: acc.wl,
                gender: acc.mc_option || 'M',
            }));
            setAccounts(updatedAccounts);
            saveToLocalStorage(activeGame.id, updatedAccounts);
            setLastSyncedAt(new Date());
            setConflictData(null);
        } catch (err) {
            console.error('Failed to resolve conflict:', err);
        } finally {
            setIsResolving(false);
        }
    }, [conflictData, isResolving, getToken, activeGame.id, saveToLocalStorage]);

    useEffect(() => {
        const loadAccounts = async () => {
            const localAccounts = loadFromLocalStorage(activeGame.id);
            let currentAccounts: GameAccount[] = [];

            if (user) {
                const { accounts: apiAccounts, lastSyncedAt } = await fetchFromApi(activeGame.id);
                if (apiAccounts && apiAccounts.length > 0) {
                    if (localAccounts.length > 0) {
                        localStorage.setItem(
                            `${STORAGE_KEYS.localBackup}_${activeGame.id}`,
                            JSON.stringify(localAccounts)
                        );
                    }
                    currentAccounts = apiAccounts;
                    setLastSyncedAt(lastSyncedAt);
                } else {
                    currentAccounts = localAccounts;
                    setLastSyncedAt(null);
                }
                setConflictData(null);
            } else {
                const backup = localStorage.getItem(`${STORAGE_KEYS.localBackup}_${activeGame.id}`);
                if (backup) {
                    localStorage.removeItem(`${STORAGE_KEYS.localBackup}_${activeGame.id}`);
                }
                currentAccounts = localAccounts;
                setLastSyncedAt(null);
                setConflictData(null);
            }

            setAccounts(currentAccounts);
            saveToLocalStorage(activeGame.id, currentAccounts);

            const activeKey = `${STORAGE_KEYS.activeAccount}_${activeGame.id}`;
            const storedActiveId = localStorage.getItem(activeKey);
            if (storedActiveId) {
                const exists = currentAccounts.some((a: GameAccount) => a.id === storedActiveId);
                setActiveAccountId(exists ? storedActiveId : currentAccounts[0]?.id || 'account_1');
            } else {
                setActiveAccountId(currentAccounts[0]?.id || 'account_1');
            }

            setLoaded(true);
        };

        loadAccounts();
    }, [activeGame.id, user, loadFromLocalStorage, saveToLocalStorage, fetchFromApi]);

    const mergeAccounts = (local: GameAccount[], api: GameAccount[]): GameAccount[] => {
        const seenIds = new Set<string>();
        const merged: GameAccount[] = [];

        for (const acc of api) {
            if (!seenIds.has(acc.id)) {
                seenIds.add(acc.id);
                merged.push(acc);
            }
        }

        for (const localAcc of local) {
            if (!localAcc.id.startsWith('db_')) {
                const existsInApi = merged.some(m =>
                    m.id === localAcc.id ||
                    (m.name.toLowerCase() === localAcc.name.toLowerCase() && m.server.toLowerCase() === localAcc.server.toLowerCase())
                );
                if (!existsInApi && !seenIds.has(localAcc.id)) {
                    seenIds.add(localAcc.id);
                    merged.push(localAcc);
                }
            }
        }
        return merged;
    };

    const changeActiveAccount = useCallback((newId: string) => {
        setActiveAccountId(newId);
        const activeKey = `${STORAGE_KEYS.activeAccount}_${activeGame.id}`;
        localStorage.setItem(activeKey, newId);
    }, [activeGame.id]);

    const updateActiveAccount = useCallback((key: keyof GameAccount, value: string | number) => {
        const currentAccount = accounts.find(acc => acc.id === activeAccountId);
        if (!currentAccount) return;

        const updatedAccounts = accounts.map(acc =>
            acc.id === activeAccountId ? { ...acc, [key]: value } : acc
        );
        setAccounts(updatedAccounts);
        saveToLocalStorage(activeGame.id, updatedAccounts);
        setLastSyncedAt(null);
    }, [accounts, activeAccountId, activeGame.id, saveToLocalStorage]);

    const addAccount = useCallback(() => {
        const newId = `local_${Date.now()}`;
        const newAcc: GameAccount = {
            id: newId,
            name: `Alt ${accounts.length + 1}`,
            server: 'America',
            ar: 1,
            wl: '0',
            gender: 'M',
        };
        const newAccounts = [...accounts, newAcc];
        setAccounts(newAccounts);
        saveToLocalStorage(activeGame.id, newAccounts);
        changeActiveAccount(newId);
        setLastSyncedAt(null);
    }, [accounts, activeGame.id, saveToLocalStorage, changeActiveAccount]);

    const deleteActiveAccount = useCallback(() => {
        if (accounts.length <= 1) return;

        const newAccounts = accounts.filter(acc => acc.id !== activeAccountId);
        const nextId = newAccounts[0].id;

        setAccounts(newAccounts);
        changeActiveAccount(nextId);
        saveToLocalStorage(activeGame.id, newAccounts);
        setLastSyncedAt(null);
    }, [accounts, activeAccountId, activeGame.id, saveToLocalStorage, changeActiveAccount]);

    const exportData = useCallback((): string | null => {
        const localWishesKey = `wishes-${activeGame.id}`;
        const localWishes = localStorage.getItem(localWishesKey);
        const wishes = localWishes ? JSON.parse(localWishes) : [];

        const exportPayload = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            source: 'local',
            gameId: activeGame.id,
            accounts: accounts.map(acc => ({
                name: acc.name,
                server: acc.server,
                ar: acc.ar,
                wl: acc.wl,
                gender: acc.gender,
            })),
            wishes: wishes,
        };

        return JSON.stringify(exportPayload, null, 2);
    }, [accounts, activeGame.id]);

    const importData = useCallback(async (jsonData: string): Promise<boolean> => {
        try {
            const data = JSON.parse(jsonData);
            if (!data.version || (!data.accounts && !data.wishes)) {
                return false;
            }

            if (data.accounts && Array.isArray(data.accounts)) {
                const newAccounts = data.accounts.map((acc: any, idx: number) => ({
                    id: `local_${Date.now()}_${idx}`,
                    name: acc.name || 'Imported',
                    server: acc.server || 'America',
                    ar: parseInt(acc.ar, 10) || 1,
                    wl: acc.wl || '0',
                    gender: acc.gender || 'M',
                }));
                const combinedAccounts = [...accounts, ...newAccounts];
                setAccounts(combinedAccounts);
                saveToLocalStorage(activeGame.id, combinedAccounts);
                if (newAccounts.length > 0) {
                    changeActiveAccount(newAccounts[0].id);
                }

                const token = getToken();
                if (token) {
                    const success = await syncToApi(activeGame.id, combinedAccounts);
                    if (success) {
                        setLastSyncedAt(new Date());
                    }
                }
            }

            if (data.wishes && Array.isArray(data.wishes)) {
                const existingWishesKey = `wishes-${activeGame.id}`;
                const existingWishes = localStorage.getItem(existingWishesKey);
                const existingWishesArray = existingWishes ? JSON.parse(existingWishes) : [];
                const combinedWishes = [...existingWishesArray, ...data.wishes];
                localStorage.setItem(existingWishesKey, JSON.stringify(combinedWishes));
            }

            setLastSyncedAt(null);
            return true;
        } catch {
            return false;
        }
    }, [accounts, activeGame.id, saveToLocalStorage, changeActiveAccount, getToken, syncToApi]);

    const importFullBackup = useCallback(async (jsonData: string): Promise<boolean> => {
        try {
            const data = JSON.parse(jsonData);
            if (!data.version || (!data.accounts && !data.wishes)) {
                return false;
            }

            if (data.accounts && Array.isArray(data.accounts)) {
                const newAccounts = data.accounts.map((acc: any, idx: number) => ({
                    id: `local_${Date.now()}_${idx}`,
                    name: acc.name || 'Imported',
                    server: acc.server || 'America',
                    ar: parseInt(acc.ar, 10) || 1,
                    wl: acc.wl || '0',
                    gender: acc.gender || 'M',
                }));
                setAccounts(newAccounts);
                saveToLocalStorage(activeGame.id, newAccounts);
                if (newAccounts.length > 0) {
                    changeActiveAccount(newAccounts[0].id);
                }
            }

            if (data.wishes && Array.isArray(data.wishes)) {
                localStorage.setItem(`wishes-${activeGame.id}`, JSON.stringify(data.wishes));
            }

            setLastSyncedAt(null);
            return true;
        } catch {
            return false;
        }
    }, [activeGame.id, saveToLocalStorage, changeActiveAccount]);

    const importLocalAccounts = useCallback(() => {
        const backupKey = `${STORAGE_KEYS.localBackup}_${activeGame.id}`;
        const backupData = localStorage.getItem(backupKey);
        if (!backupData) return;

        let localAccounts: GameAccount[];
        try {
            localAccounts = JSON.parse(backupData);
        } catch {
            return;
        }

        if (!Array.isArray(localAccounts) || localAccounts.length === 0) return;

        const newAccounts = localAccounts.map((acc: GameAccount, idx: number) => ({
            id: `local_import_${Date.now()}_${idx}`,
            name: acc.name,
            server: acc.server,
            ar: acc.ar,
            wl: acc.wl,
            gender: acc.gender,
        }));

        const combined = [...accounts, ...newAccounts];
        setAccounts(combined);
        saveToLocalStorage(activeGame.id, combined);
        setLastSyncedAt(null);

        if (newAccounts.length > 0) {
            changeActiveAccount(newAccounts[0].id);
        }
    }, [accounts, activeGame.id, saveToLocalStorage, changeActiveAccount]);

    const syncAccounts = useCallback(async () => {
        const success = await syncToApi(activeGame.id, accounts);
        if (success) {
            setLastSyncedAt(new Date());
        }
        return success;
    }, [activeGame.id, accounts, syncToApi]);

    const activeAccount = accounts.find(acc => acc.id === activeAccountId) || accounts[0];

    if (!loaded) {
        return null;
    }

    return (
        <SettingsContext.Provider value={{
            accounts,
            activeAccountId,
            setActiveAccountId: changeActiveAccount,
            activeAccount,
            addAccount,
            updateActiveAccount,
            deleteActiveAccount,
            exportData,
            importData,
            importFullBackup,
            importLocalAccounts,
            lastSyncedAt,
            syncAccounts,
            conflictData,
            setConflictData,
            resolveConflict,
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}