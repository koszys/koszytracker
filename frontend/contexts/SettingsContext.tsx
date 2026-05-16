"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEYS = {
    accounts: 'wish-tracker-accounts',
    activeAccount: 'wish-tracker-active-account',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [accounts, setAccounts] = useState<GameAccount[]>([]);
    const [activeAccountId, setActiveAccountId] = useState('account_1');
    const [loaded, setLoaded] = useState(false);

    const createDefaultAccount = (): GameAccount => ({
        id: 'account_1',
        name: 'Main',
        server: 'America',
        ar: 60,
        wl: '8',
        gender: 'M',
    });

    useEffect(() => {
        const storedAccounts = localStorage.getItem(STORAGE_KEYS.accounts);
        if (storedAccounts) {
            try {
                const parsed = JSON.parse(storedAccounts);
                setAccounts(parsed);
            } catch {
                setAccounts([createDefaultAccount()]);
            }
        } else {
            setAccounts([createDefaultAccount()]);
        }

        const storedActiveId = localStorage.getItem(STORAGE_KEYS.activeAccount);
        if (storedActiveId) {
            setActiveAccountId(storedActiveId);
        }
        setLoaded(true);
    }, []);

    const changeActiveAccount = useCallback((newId: string) => {
        setActiveAccountId(newId);
        localStorage.setItem(STORAGE_KEYS.activeAccount, newId);
    }, []);

    const updateActiveAccount = useCallback((key: keyof GameAccount, value: string | number) => {
        const updatedAccounts = accounts.map(acc =>
            acc.id === activeAccountId ? { ...acc, [key]: value } : acc
        );
        setAccounts(updatedAccounts);
        localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(updatedAccounts));
    }, [accounts, activeAccountId]);

    const addAccount = useCallback(() => {
        const newId = `account_${Date.now()}`;
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
        localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(newAccounts));
        changeActiveAccount(newId);
    }, [accounts, changeActiveAccount]);

    const deleteActiveAccount = useCallback(() => {
        if (accounts.length <= 1) return;
        const newAccounts = accounts.filter(acc => acc.id !== activeAccountId);
        const nextId = newAccounts[0].id;

        setAccounts(newAccounts);
        changeActiveAccount(nextId);
        localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(newAccounts));
    }, [accounts, activeAccountId, changeActiveAccount]);

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
                id: `account_${Date.now()}`,
                name: data.account.name || 'Imported',
                server: data.account.server || 'America',
                ar: parseInt(data.account.ar, 10) || 1,
                wl: data.account.wl || '0',
                gender: data.account.gender || 'M',
            };

            const newAccounts = [...accounts, importedAccount];
            setAccounts(newAccounts);
            localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(newAccounts));
            changeActiveAccount(importedAccount.id);
            return true;
        } catch {
            return false;
        }
    }, [accounts, changeActiveAccount]);

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