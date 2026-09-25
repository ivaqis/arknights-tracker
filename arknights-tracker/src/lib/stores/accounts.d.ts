import type { Writable } from 'svelte/store';

export interface Account {
    id: string;
    name: string;
    serverUid: string | null;
    serverId?: string;
}

export interface AccountUpdates {
    name?: string;
    uid?: string;
    serverId?: string;
}

export interface AccountStore {
    accounts: Writable<Account[]>;
    selectedId: Writable<string>;

    createEmptyAccount: () => void;
    addAccount: (gameUid: string, nickname?: string | null, serverId?: string | null) => void;
    deleteAccount: (idToDelete: string) => void;
    renameAccount: (id: string, newName: string) => void;
    updateAccount: (id: string, updates: AccountUpdates) => void;
    selectAccount: (id: string) => void;
    setServerUid: (serverUid: string) => void;
    clearCurrentData: () => void;
}

export declare const accountStore: AccountStore;