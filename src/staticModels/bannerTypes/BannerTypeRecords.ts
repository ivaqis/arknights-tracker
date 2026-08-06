import { BannerType } from "@models/banners/BannerType";
import { ShortBannerType } from "@models/banners/ShortBannerType";
import { BannerTypeEntity } from "@staticModels/bannerTypes/BannerTypeEntity";
import { RecordsModel } from "@staticModels/RecordsModel";

export class BannerTypeRecords extends RecordsModel<BannerTypeEntity> {

    public constructor(list: BannerTypeEntity[]) {
        super(list, (entity) => entity.type, "BannerTypeRecords");
    }

    public getByBannerType(bannerType: BannerType): BannerTypeEntity {
        const short = BannerType.getShortBannerTypeName(bannerType);

        return this.getByShortBannerType(short);
    }

    public getByShortBannerType(bannerType: ShortBannerType): BannerTypeEntity {
        return this.get(bannerType) as BannerTypeEntity;
    }

    protected isValid(obj: BannerTypeEntity): boolean {
        return ShortBannerType.isShortBannerType(obj.type);
    }
}