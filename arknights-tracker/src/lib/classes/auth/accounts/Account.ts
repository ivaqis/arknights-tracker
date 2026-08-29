import type { AccountData } from "$lib/classes/auth/accounts/AccountData";
import { AccountExistError } from "$lib/classes/auth/accounts/AccountExistError";
import type { AccountUniqueConstraint } from "$lib/classes/auth/accounts/AccountUniqueConstraint";
import type { AccountUpdates } from "$lib/classes/auth/accounts/AccountUpdates";

export class Account {
    public static readonly DEFAULT_ID: string = "main";
    public static readonly DEFAULT_NAME: string = "Main Account";

    private readonly _updateCallback: () => void;
    private readonly _isExist: (value: AccountUniqueConstraint) => boolean;

    private readonly _id: string;

    private _name: string;
    private _serverUid: string | null;
    private _serverId: string | null;

    public constructor(updateCallback: () => void,
                       isExist: (value: AccountUniqueConstraint) => boolean,
                       id: string,
                       name: string,
                       serverUid: string | null,
                       serverId: string | null
    ) {
        this._updateCallback = updateCallback;
        this._isExist = isExist;

        this._id = id;
        this._name = name;
        this._serverUid = serverUid;
        this._serverId = serverId;
    }

    public static toJsonList(accounts: Account[]): string {
        return JSON.stringify(accounts.map(account => account.toData()));
    }

    public static createFromData(updateCallback: () => void, isExist: (value: AccountUniqueConstraint) => boolean, data: AccountData): Account {
        return new Account(
            updateCallback,
            isExist,
            data.id,
            data.name,
            data.serverUid,
            data.serverId
        );
    }

    public static createDefault(updateCallback: () => void, isExist: (value: AccountUniqueConstraint) => boolean): Account {
        return new Account(
            updateCallback,
            isExist,
            this.DEFAULT_ID,
            this.DEFAULT_NAME,
            null,
            null
        );
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    /**
     * For multiple updates use .update() method
     * @param value
     */
    public set name(value: string) {
        this._name = value;

        this._updateCallback();
    }

    public get serverUid(): string | null {
        return this._serverUid;
    }

    /**
     * For multiple updates use .update() method
     * @param value
     */
    public set serverUid(value: string | null) {
        const exists = value ? this._isExist({ serverUid: value }) : false;

        if (exists) {
            throw new AccountExistError(`serverUid '${value}' already exists`);
        }

        this._serverUid = value;

        this._updateCallback();
    }

    public get serverId(): string | null {
        return this._serverId;
    }

    /**
     * For multiple updates use .update() method
     * @param value
     */
    public set serverId(value: string | null) {
        this._serverId = value;

        this._updateCallback();
    }

    public update(updates: AccountUpdates) {
        if (updates.name) {
            this._name = updates.name;
        }

        if (updates.uid !== undefined) {
            const exists = updates.uid ? this._isExist({ serverUid: updates.uid }) : false;

            if (exists) {
                throw new AccountExistError(`serverUid '${updates.uid}' already exists`);
            }

            this._serverUid = updates.uid;
        }

        if (updates.serverId !== undefined) {
            this._serverId = updates.serverId;
        }

        this._updateCallback();
    }

    public toData(): AccountData {
        return {
            id: this.id,
            name: this.name,
            serverUid: this.serverUid,
            serverId: this.serverId
        };
    }
}