import { BannerType } from "@models/banners/BannerType";
import { IEntityClass } from "@models/IEntityClass";
import { CharPull } from "@models/pulls/CharPull";
import { BannersPullsEntity } from "@models/pulls/entities/BannersPullsEntity";
import { Pull } from "@models/pulls/Pull";
import { WeaponPull } from "@models/pulls/WeaponPull";
import { BannersPullsData } from "@services/bannerDataFetcher/BannersPullsData";

export class BannersPulls implements IEntityClass<BannersPullsEntity> {
    private readonly _specialPulls: CharPull[];
    private readonly _jointPulls: CharPull[];
    private readonly _standardPulls: CharPull[];
    private readonly _beginnerPulls: CharPull[];
    private readonly _weaponPulls: WeaponPull[];

    private constructor(specialPulls: CharPull[], jointPulls: CharPull[], standardPulls: CharPull[], beginnerPulls: CharPull[], weaponPulls: WeaponPull[]) {
        this._specialPulls = specialPulls;
        this._jointPulls = jointPulls;
        this._standardPulls = standardPulls;
        this._beginnerPulls = beginnerPulls;
        this._weaponPulls = weaponPulls;
    }

    public static createFromData(data: BannersPullsData): BannersPulls {
        return new BannersPulls(
            data[BannerType.CHAR_SPECIAL].map(CharPull.createFromData),
            data[BannerType.CHAR_JOINT].map(CharPull.createFromData),
            data[BannerType.CHAR_STANDARD].map(CharPull.createFromData),
            data[BannerType.CHAR_BEGINNER].map(CharPull.createFromData),
            data[BannerType.WEAPON].map(WeaponPull.createFromData)
        );
    }

    public static createFromEntity(entity: BannersPullsEntity): BannersPulls {
        return new BannersPulls(
            entity[BannerType.CHAR_SPECIAL].map(CharPull.createFromEntity),
            entity[BannerType.CHAR_JOINT].map(CharPull.createFromEntity),
            entity[BannerType.CHAR_STANDARD].map(CharPull.createFromEntity),
            entity[BannerType.CHAR_BEGINNER].map(CharPull.createFromEntity),
            entity[BannerType.WEAPON].map(WeaponPull.createFromEntity)
        );
    }

    public getEntity(): BannersPullsEntity {
        return {
            [BannerType.CHAR_STANDARD]: this._standardPulls.map(p => p.getEntity()),
            [BannerType.CHAR_BEGINNER]: this._beginnerPulls.map(p => p.getEntity()),
            [BannerType.CHAR_SPECIAL]: this._specialPulls.map(p => p.getEntity()),
            [BannerType.CHAR_JOINT]: this._jointPulls.map(p => p.getEntity()),
            [BannerType.WEAPON]: this._weaponPulls.map(p => p.getEntity())
        };
    }
}