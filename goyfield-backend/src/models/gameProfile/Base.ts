import { BaseEntity } from "@models/gameProfile/entities/BaseEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { BaseData } from "@services/skportDetailFetcher/contracts/BaseData.js";

export class Base implements IEntityClass<BaseEntity> {
    private readonly _serverId: string;
    private readonly _roleId: string;
    private readonly _name: string;
    private readonly _createTime: string;
    private readonly _saveTime: string;
    private readonly _lastLoginTime: string;
    private readonly _exp: number;
    private readonly _level: number;
    private readonly _worldLevel: number;
    private readonly _gender: number;
    private readonly _avatarUrl: string;
    private readonly _charNum: number;
    private readonly _weaponNum: number;
    private readonly _docNum: number;

    private constructor(entity: BaseEntity) {
        this._serverId = entity.serverId;
        this._roleId = entity.roleId;
        this._name = entity.name;
        this._createTime = entity.createTime;
        this._saveTime = entity.saveTime;
        this._lastLoginTime = entity.lastLoginTime;
        this._exp = entity.exp;
        this._level = entity.level;
        this._worldLevel = entity.worldLevel;
        this._gender = entity.gender;
        this._avatarUrl = entity.avatarUrl;
        this._charNum = entity.charNum;
        this._weaponNum = entity.weaponNum;
        this._docNum = entity.docNum;
    }

    public static getFromData(data: BaseData, serverId: string): Base {
        return this.getFromEntity({
            serverId,
            roleId: data.roleId,
            name: data.name,
            createTime: data.createTime,
            saveTime: data.saveTime,
            lastLoginTime: data.lastLoginTime,
            exp: data.exp,
            level: data.level,
            worldLevel: data.worldLevel,
            gender: data.gender,
            avatarUrl: data.avatarUrl,
            charNum: data.charNum,
            weaponNum: data.weaponNum,
            docNum: data.docNum
        });
    }

    public static getFromEntity(entity: BaseEntity): Base {
        return new Base(entity);
    }

    public get serverId(): string {
        return this._serverId;
    }

    public get roleId(): string {
        return this._roleId;
    }

    public get name(): string {
        return this._name;
    }

    public get createTime(): string {
        return this._createTime;
    }

    public get saveTime(): string {
        return this._saveTime;
    }

    public get lastLoginTime(): string {
        return this._lastLoginTime;
    }

    public get exp(): number {
        return this._exp;
    }

    public get level(): number {
        return this._level;
    }

    public get worldLevel(): number {
        return this._worldLevel;
    }

    public get gender(): number {
        return this._gender;
    }

    public get avatarUrl(): string {
        return this._avatarUrl;
    }

    public get charNum(): number {
        return this._charNum;
    }

    public get weaponNum(): number {
        return this._weaponNum;
    }

    public get docNum(): number {
        return this._docNum;
    }

    public getEntity(): BaseEntity {
        return {
            avatarUrl: this.avatarUrl,
            charNum: this.charNum,
            createTime: this.createTime,
            docNum: this.docNum,
            exp: this.exp,
            gender: this.gender,
            lastLoginTime: this.lastLoginTime,
            level: this.level,
            name: this.name,
            roleId: this.roleId,
            saveTime: this.saveTime,
            weaponNum: this.weaponNum,
            worldLevel: this.worldLevel,
            serverId: this.serverId
        };
    }
}