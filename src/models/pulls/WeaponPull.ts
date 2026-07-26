import { IEntityClass } from "@models/IEntityClass";
import { WeaponPullEntity } from "@models/pulls/entities/WeaponPullEntity";
import { Pull } from "@models/pulls/Pull";
import { WeaponPullData } from "@services/bannerDataFetcher/entities/WeaponPullData";

export class WeaponPull extends Pull implements IEntityClass<WeaponPullEntity> {
    private readonly _weaponId: string;
    private readonly _weaponName: string;
    private readonly _weaponType: string;

    public constructor(weaponPullEntity: WeaponPullData) {
        super(weaponPullEntity);

        this._weaponId = weaponPullEntity.weaponId;
        this._weaponName = weaponPullEntity.weaponName;
        this._weaponType = weaponPullEntity.weaponType;
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
            weaponType: this._weaponType,
            rarity: this.rarity,
            isNew: this.isNew,
            bannerId: this.bannerId,
            gachaTs: this.gachaTs,
            seqId: this.seqId
        };
    }
}