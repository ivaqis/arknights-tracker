import { Pull } from "@models/pulls/Pull";
import { WeaponPullEntity } from "@services/bannerDataFetcher/entities/WeaponPullEntity";

export class WeaponPull extends Pull {
    private readonly _weaponId: string;
    private readonly _weaponName: string;
    private readonly _weaponType: string;

    public constructor(weaponPullEntity: WeaponPullEntity) {
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
}