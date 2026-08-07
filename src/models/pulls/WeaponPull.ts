import { IEntityClass } from "@models/IEntityClass.js";
import { WeaponPullEntity } from "@models/pulls/entities/WeaponPullEntity.js";
import { Pull } from "@models/pulls/Pull.js";
import { StablePull } from "@models/stablePullId/StablePull.js";
import { WeaponPullData } from "@services/bannerDataFetcher/entities/WeaponPullData.js";

export class WeaponPull extends Pull implements IEntityClass<WeaponPullEntity> {
    private readonly _weaponId: string;
    private readonly _weaponName: string;
    private readonly _weaponType: string;

    private constructor(poolId: string, rarity: number, isNew: boolean, gachaTs: string, seqId: string, weaponId: string, weaponName: string, weaponType: string) {
        super(poolId, rarity, isNew, gachaTs, seqId);
        this._weaponId = weaponId;
        this._weaponName = weaponName;
        this._weaponType = weaponType;
    }

    public static createFromData(data: WeaponPullData): WeaponPull {
        return new WeaponPull(
            data.poolId,
            data.rarity,
            data.isNew,
            data.gachaTs,
            data.seqId,
            data.weaponId,
            data.weaponName,
            data.weaponType
        );
    }

    public static createFromEntity(entity: WeaponPullEntity): WeaponPull {
        return new WeaponPull(
            entity.bannerId,
            entity.rarity,
            entity.isNew,
            entity.gachaTs,
            entity.seqId,
            entity.weaponId,
            entity.weaponName,
            entity.weaponType
        );
    }

    public get weaponId(): string {
        return this._weaponId;
    }

    public get weaponName(): string {
        return this._weaponName;
    }

    public get weaponType(): string {
        return this._weaponType;
    }

    public getEntity(): WeaponPullEntity {
        return {
            weaponId: this._weaponId,
            weaponName: this._weaponName,
            weaponType: this._weaponType,
            rarity: this.rarity,
            isNew: this.isNew,
            bannerId: this.bannerId,
            gachaTs: this.gachaTs,
            seqId: this.seqId
        };
    }

    public getStablePull(): StablePull {
        return new StablePull(
            this.weaponId,
            false,
            this.bannerId,
            this.rarity,
            this.isNew,
            this.gachaTs,
            this.seqId
        );
    }
}