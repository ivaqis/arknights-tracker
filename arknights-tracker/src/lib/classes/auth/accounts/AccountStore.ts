import { browser } from "$app/environment";
import { Account } from "$lib/classes/auth/accounts/Account";
import type { AccountCreateParams } from "$lib/classes/auth/accounts/AccountCreateParams";
import type { AccountData } from "$lib/classes/auth/accounts/AccountData";
import { AccountExistError } from "$lib/classes/auth/accounts/AccountExistError";
import type { AccountUniqueConstraint } from "$lib/classes/auth/accounts/AccountUniqueConstraint";
import type { AccountUpdates } from "$lib/classes/auth/accounts/AccountUpdates";
import { get, type Readable, writable, type Writable } from "svelte/store";

export class AccountStore {
    public static readonly ACCOUNTS_KEY: string = "ark_tracker_accounts_meta";
    public static readonly SELECTED_ID_KEY: string = "ark_tracker_selected_account_id";
    public static readonly DEFAULT_NAME_REGEX: RegExp = /^Account\s+(\d+)$/;

    private readonly _updateCallback: () => void = () => this.forceUpdateAccounts();
    private readonly _isExistCallback = (value: AccountUniqueConstraint) => this.isExist(value);

    private readonly _accounts: Writable<Account[]>;
    private readonly _selectedId: Writable<string>;
    private readonly _currentAccount: Writable<Account>;

    public constructor() {
        const initialAccounts: Account[] = this.getInitialAccounts();
        const initialSelectedId: string = this.getInitialSelectedAccountId(initialAccounts);
        const initialCurrentAccount: Account = initialAccounts.find(account => account.id === initialSelectedId)!;

        this._accounts = writable(initialAccounts);
        this._selectedId = writable(initialSelectedId);
        this._currentAccount = writable(initialCurrentAccount);

        this.initializeStores();
    }

    private static generateId(): string {
        if (browser && self.crypto && self.crypto.randomUUID) {
            return self.crypto.randomUUID();
        }

        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    private getInitialAccounts(): Account[] {
        if (!browser) {
            return [ Account.createDefault(this._updateCallback, this._isExistCallback) ];
        }

        const stored = localStorage.getItem(AccountStore.ACCOUNTS_KEY);

        if (!stored) {
            return [ Account.createDefault(this._updateCallback, this._isExistCallback) ];
        }

        try {
            const data = JSON.parse(stored) as AccountData[];

            return data.map(item => Account.createFromData(this._updateCallback, this._isExistCallback, item));
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.stack ?? e.name);
            } else {
                console.error(e);
            }

            return [ Account.createDefault(this._updateCallback, this._isExistCallback) ];
        }
    }

    private getInitialSelectedAccountId(accounts: Account[]): string {
        if (!browser) {
            return Account.DEFAULT_ID;
        }

        const stored = localStorage.getItem(AccountStore.SELECTED_ID_KEY);

        if (!stored) {
            return Account.DEFAULT_ID;
        }

        if (accounts.some(account => account.id === stored)) {
            return stored;
        }

        return Account.DEFAULT_ID;
    }

    public get accounts(): Readable<readonly Account[]> {
        return this._accounts;
    }

    public get selectedId(): Readable<string> {
        return this._selectedId;
    }

    public get currentAccount(): Readable<Account> {
        return this._currentAccount;
    }

    public findAccount(id: string): Account | null {
        const list = get(this._accounts);

        return list.find(account => account.id === id) ?? null;
    }

    public findAccountByServerUid(serverUid: string): Account | null {
        const list = get(this._accounts);

        return list.find(account => account.serverUid === serverUid) ?? null;
    }

    public selectAccount(id: string): Account | null {
        const account = this.findAccount(id);

        if (!account) {
            return null;
        }

        this._selectedId.set(id);

        return account;
    }

    /**
     * @param params
     * @returns Returns new account
     * @throws {AccountExistError} if serverUid already exist
     */
    public createAccount(params: AccountCreateParams): Account {
        const exited = params.uid ? this.findAccountByServerUid(params.uid) : null;

        if (exited) {
            throw new AccountExistError(`serverUid '${exited.serverUid}' already exists`);
        }

        const id = AccountStore.generateId();
        const name = params.name ?? this.generateDefaultName();
        const serverUid = params.uid ?? null;
        const serverId = params.serverId ?? null;

        const account = new Account(
            this._updateCallback,
            this._isExistCallback,
            id,
            name,
            serverUid,
            serverId
        );

        const list = get(this._accounts);
        list.push(account);

        this.forceUpdateAccounts();

        return account;
    }

    public createEmptyAccount(): Account {
        return this.createAccount({
            serverId: "3"
        });
    }

    public updateAccount(id: string, updates: AccountUpdates): Account | null {
        let account = this.findAccount(id);

        if (account) {
            account.update(updates);
        }

        return account;
    }

    /**
     * @param id
     * @returns {true} if account was deleted
     * @returns {false} if account does not exist, or it's the only existing account
     */
    public deleteAccount(id: string): boolean {
        const list = get(this._accounts);

        if (list.length < 2) {
            return false;
        }

        const account = this.findAccount(id);

        if (!account) {
            return false;
        }

        const currentId = get(this._selectedId);

        if (currentId === account.id) {
            const newAccount = list.find(account => account.id !== currentId)!;

            this.selectAccount(newAccount.id);
        }

        const index = list.findIndex(account => account.id === id);

        list.splice(index, 1);

        this.forceUpdateAccounts();

        return true;
    }

    public addAccount(serverUid: string, name: string | null, serverId: string | null): Account {
        serverId ??= "3";

        const existing = this.findAccountByServerUid(serverUid);

        if (existing) {
            existing.serverId = serverId;
            this.selectAccount(existing.id);

            return existing;
        }

        const current = get(this._currentAccount);

        if (!current.serverUid) {
            current.update({
                uid: serverUid,
                serverId: serverId,
            });

            return current;
        }

        return this.createAccount({
            uid: serverUid,
            serverId: serverId,
            name: name ?? undefined
        });
    }

    public renameAccount(id: string, name: string): Account | null {
        const account = this.findAccount(id);

        if (!account) {
            return null;
        }

        account.name = name;

        return account;
    }

    public clearCurrentData() {
        if (!browser) {
            return;
        }

        const current = get(this._currentAccount);

        localStorage.removeItem(`ark_tracker_data_${current.id}`);

        current.update({
            serverId: "3",
            uid: null
        });

        window.dispatchEvent(new CustomEvent("ark_tracker_clear_data", { detail: { id: current } }));
        console.log("[Accounts] Account fully cleared.");
    }

    private forceUpdateAccounts() {
        this._accounts.update(list => list);
    }

    private generateDefaultName(): string {
        const list = get(this._accounts);

        const max = list.reduce(
            (max, account) => {
                const match = account.name.match(AccountStore.DEFAULT_NAME_REGEX);

                if (!match) {
                    return max;
                }

                const num = parseInt(match[1], 10);

                return Math.max(num, max);
            },
            1
        );

        return `Account ${max + 1}`;
    }

    private isExist(value: AccountUniqueConstraint): boolean {
        if (value.id) {
            const existing = this.findAccount(value.id);

            if (existing) {
                return true;
            }
        }

        if (value.serverUid) {
            const existing = this.findAccountByServerUid(value.serverUid);

            if (existing) {
                return true;
            }
        }

        return false;
    }

    private initializeStores() {
        if (!browser) {
            return;
        }

        const updateSelectedAccount = (accounts: Account[], selectedId: string) => {
            this._currentAccount.update(current => {
                if (current.id === selectedId) {
                    return current;
                }

                const selected = accounts.find(account => account.id === selectedId);

                if (!selected) {
                    throw new Error(`Account with id ${selectedId} not found.`);
                }

                return selected;
            });
        };

        this._accounts.subscribe(accounts => {
            updateSelectedAccount(accounts, get(this._selectedId));

            localStorage.setItem(AccountStore.ACCOUNTS_KEY, Account.toJsonList(accounts));
        });

        this._selectedId.subscribe(accountId => {
            updateSelectedAccount(get(this._accounts), accountId);

            localStorage.setItem(AccountStore.SELECTED_ID_KEY, accountId);
        });
    }
}