import { BannerType } from "@models/banners/BannerType.js";
import { DbBannerType } from "@models/banners/DbBannerType.js";
import { ShortBannerType } from "@models/banners/ShortBannerType.js";
import { BannerTypeEntity } from "@staticModels/bannerTypes/BannerTypeEntity.js";
import { RecordsModel } from "@staticModels/RecordsModel.js";

export class BannerTypeRecords extends RecordsModel<BannerTypeEntity> {

    public constructor(list: BannerTypeEntity[]) {
        super(list, (entity) => entity.type, "BannerTypeRecords");
    }

    public getByDbBannerType(dbBannerType: DbBannerType): BannerTypeEntity {
        const bannerType = BannerType.getBannerTypeByDbBannerType(dbBannerType);

        return this.getByBannerType(bannerType);
    }

    public getByBannerType(bannerType: BannerType): BannerTypeEntity {
        const short = BannerType.getShortBannerTypeName(bannerType);

        return this.getByShortBannerType(short);
    }

    public getByShortBannerType(bannerType: ShortBannerType): BannerTypeEntity {
        return this.get(bannerType) as BannerTypeEntity;
    }

    protected isValid(obj: BannerTypeEntity): boolean {
        const isValid = ShortBannerType.isShortBannerType(obj.type);

        if (!isValid) {
            throw new Error(`${this.namePrefix}Invalid banner type entity: ${JSON.stringify(obj)}`);
        }

        return true;
    }
}