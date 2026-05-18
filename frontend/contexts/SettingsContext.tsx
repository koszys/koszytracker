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

interface SettingsContextValue {
    accounts: GameAccount[];
    activeAccountId: string;
    setActiveAccountId: (id: string) => void;
    activeAccount: GameAccount | undefined;
    addAccount: () => void;
    updateActiveAccount: (key: keyof GameAccount, value: string | number) => void;
    deleteActiveAccount: () => void;
    exportAccount: () => string | null;
    importAccount: (jsonData: string) => boolean;
    isSynced: boolean;
    syncAccounts: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEYS = {
    accounts: 'wish-tracker-accounts',
    activeAccount: 'wish-tracker-active-account',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function SettingsProvider({ children }: { children: ReactNode }) {
    const { user, getToken } = useAuth();
    const { activeGame } = useGame();

    const [accounts, setAccounts] = useState<GameAccount[]>([]);
    const [activeAccountId, setActiveAccountId] = useState('account_1');
    const [loaded, setLoaded] = useState(false);
    const [isSynced, setIsSynced] = useState(false);

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
        if (!token) return null;

        try {
            const res = await fetch(`${API_BASE}/api/accounts?game_id=${gameId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                return data.map((acc: any) => ({
                    id: `db_${acc.id}`,
                    name: acc.name,
                    server: acc.server,
                    ar: acc.ar,
                    wl: acc.wl,
                    gender: acc.mc_option || 'M',
                }));
            }
        } catch (err) {
            console.error('Failed to fetch accounts:', err);
        }
        return null;
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

    useEffect(() => {
        const loadAccounts = async () => {
            const localAccounts = loadFromLocalStorage(activeGame.id);

            if (user) {
                const apiAccounts = await fetchFromApi(activeGame.id);
                if (apiAccounts && apiAccounts.length > 0) {
                    const merged = mergeAccounts(localAccounts, apiAccounts);
                    setAccounts(merged);
                    setIsSynced(true);
                    saveToLocalStorage(activeGame.id, merged);
                } else {
                    setAccounts(localAccounts);
                    setIsSynced(false);
                }
            } else {
                setAccounts(localAccounts);
                setIsSynced(false);
            }

            const activeKey = `${STORAGE_KEYS.activeAccount}_${activeGame.id}`;
            const storedActiveId = localStorage.getItem(activeKey);
            if (storedActiveId) {
                const exists = localAccounts.some((a: GameAccount) => a.id === storedActiveId);
                setActiveAccountId(exists ? storedActiveId : localAccounts[0]?.id || 'account_1');
            } else {
                setActiveAccountId(localAccounts[0]?.id || 'account_1');
            }

            setLoaded(true);
        };

        loadAccounts();
    }, [activeGame.id, user, loadFromLocalStorage, saveToLocalStorage, fetchFromApi]);

    const mergeAccounts = (local: GameAccount[], api: GameAccount[]): GameAccount[] => {
        const merged = [...api];
        for (const localAcc of local) {
            if (!localAcc.id.startsWith('db_')) {
                const exists = merged.some(m => m.id === localAcc.id);
                if (!exists) {
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
        const updatedAccounts = accounts.map(acc =>
            acc.id === activeAccountId ? { ...acc, [key]: value } : acc
        );
        setAccounts(updatedAccounts);
        saveToLocalStorage(activeGame.id, updatedAccounts);
        setIsSynced(false);
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
        setIsSynced(false);
    }, [accounts, activeGame.id, saveToLocalStorage, changeActiveAccount]);

    const deleteActiveAccount = useCallback(() => {
        if (accounts.length <= 1) return;
        const newAccounts = accounts.filter(acc => acc.id !== activeAccountId);
        const nextId = newAccounts[0].id;

        setAccounts(newAccounts);
        changeActiveAccount(nextId);
        saveToLocalStorage(activeGame.id, newAccounts);
        setIsSynced(false);
    }, [accounts, activeAccountId, activeGame.id, saveToLocalStorage, changeActiveAccount]);

    const exportAccount = useCallback((): string | null => {
        const account = accounts.find(acc => acc.id === activeAccountId);
        if (!account) return null;

        const exportData = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            account: {
                name: account.name,
                server: account.server,
                ar: account.ar,
                wl: account.wl,
                gender: account.gender,
            },
        };

        return JSON.stringify(exportData, null, 2);
    }, [accounts, activeAccountId]);

    const importAccount = useCallback((jsonData: string): boolean => {
        try {
            const data = JSON.parse(jsonData);
            if (!data.account || !data.version) {
                return false;
            }

            const importedAccount: GameAccount = {
                id: `local_${Date.now()}`,
                name: data.account.name || 'Imported',
                server: data.account.server || 'America',
                ar: parseInt(data.account.ar, 10) || 1,
                wl: data.account.wl || '0',
                gender: data.account.gender || 'M',
            };

            const newAccounts = [...accounts, importedAccount];
            setAccounts(newAccounts);
            saveToLocalStorage(activeGame.id, newAccounts);
            changeActiveAccount(importedAccount.id);
            setIsSynced(false);
            return true;
        } catch {
            return false;
        }
    }, [accounts, activeGame.id, saveToLocalStorage, changeActiveAccount]);

    const syncAccounts = useCallback(async () => {
        const success = await syncToApi(activeGame.id, accounts);
        if (success) {
            setIsSynced(true);
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
            exportAccount,
            importAccount,
            isSynced,
            syncAccounts,
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