import { ContractWeaponEntity } from "@models/contingencyContract/entities/ContractWeaponEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { WeaponData } from "@services/contractRecordFetcher/contracts/WeaponData.js";

export class ContractWeapon implements IEntityClass<ContractWeaponEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _refineLevel: number;
    private readonly _weaponTerms: number[];

    private constructor(id: string, level: number, refineLevel: number, weaponTerms: number[]) {
        this._id = id;
        this._level = level;
        this._refineLevel = refineLevel;
        this._weaponTerms = weaponTerms;
    }

    public static getFromData(data?: WeaponData): ContractWeapon | null {
        if (!data) {
            return null;
        }

        return new ContractWeapon(
            data.id,
            data.level,
            data.refineLevel,
            data.weaponTerms
        );
    }

    public static getFromEntity(entity: ContractWeaponEntity | null): ContractWeapon | null {
        if (!entity) {
            return null;
        }

        return new ContractWeapon(
            entity.id,
            entity.level,
            entity.refineLevel,
            entity.weaponTerms
        );
    }

    public get id(): string {
        return this._id;
    }

    public get level(): number {
        return this._level;
    }

    public get refineLevel(): number {
        return this._refineLevel;
    }

    public get weaponTerms(): number[] {
        return this._weaponTerms;
    }

    public getEntity(): ContractWeaponEntity {
        return {
            id: this.id,
            level: this.level,
            refineLevel: this.refineLevel,
            weaponTerms: this.weaponTerms
        };
    }
}