import { fetchGetProfileId } from "$lib/api/getProfileId/fetchGetProfileId";
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
    private _publicServerUid: string | null;

    public constructor(updateCallback: () => void,
                       isExist: (value: AccountUniqueConstraint) => boolean,
                       id: string,
                       name: string,
                       serverUid: string | null,
                       serverId: string | null,
                       publicServerUid: string | null,
    ) {
        this._updateCallback = updateCallback;
        this._isExist = isExist;

        this._id = id;
        this._name = name;
        this._serverUid = serverUid;
        this._serverId = serverId;
        this._publicServerUid = publicServerUid;
    }

    public static toJsonList(accounts: Account[]): string {
        return JSON.stringify(accounts.map(account => (typeof account?.toData === 'function' ? account.toData() : account)));
    }

    public static createFromData(updateCallback: () => void, isExist: (value: AccountUniqueConstraint) => boolean, data: any): Account {
        if (data instanceof Account) {
            return data;
        }
        return new Account(
            updateCallback,
            isExist,
            data?.id ?? data?._id ?? this.DEFAULT_ID,
            data?.name ?? data?._name ?? this.DEFAULT_NAME,
            data?.serverUid ?? data?._serverUid ?? null,
            data?.serverId ?? data?._serverId ?? null,
            data?.publicServerUid ?? data?._publicServerUid ?? null
        );
    }

    public static createDefault(updateCallback: () => void, isExist: (value: AccountUniqueConstraint) => boolean): Account {
        return new Account(
            updateCallback,
            isExist,
            this.DEFAULT_ID,
            this.DEFAULT_NAME,
            null,
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
     * For multiple updates use `.update()` method
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
     * For multiple updates use `.update()` method
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
     * For multiple updates use `.update()` method
     * @param value
     */
    public set serverId(value: string | null) {
        this._serverId = value;

        this._updateCallback();
    }

    public get publicServerUid(): string | null {
        return this._publicServerUid;
    }

    /**
     * For multiple updates use `.update()` method
     * @param value
     */
    public set publicServerUid(value: string | null) {
        const exists = value ? this._isExist({ publicServerUid: value }) : false;

        if (exists) {
            throw new AccountExistError(`publicServerUid '${value}' already exists`);
        }

        this._publicServerUid = value;

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

        if (updates.publicServerUid !== undefined) {
            const exists = updates.publicServerUid ? this._isExist({ publicServerUid: updates.publicServerUid }) : false;

            if (exists) {
                throw new AccountExistError(`publicServerUid '${updates.publicServerUid}' already exists`);
            }

            this._publicServerUid = updates.publicServerUid;
        }

        this._updateCallback();
    }

    public async getPublicServerUid(): Promise<string | null> {
        if (!this._serverUid) {
            return null;
        }

        if (this._publicServerUid) {
            return this._publicServerUid;
        }

        const profile = await fetchGetProfileId(this._serverUid);

        if (!profile) {
            return null;
        }

        const publicId = profile.profile.publicId;

        this._publicServerUid = publicId;

        return publicId;
    }

    public toData(): AccountData {
        return {
            id: this.id,
            name: this.name,
            serverUid: this.serverUid,
            serverId: this.serverId
        };
    }

    public toJSON(): AccountData {
        return this.toData();
    }
}