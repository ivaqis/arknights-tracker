import { Banner } from "@models/banners/Banner.js";
import { DbBannerType } from "@models/banners/DbBannerType.js";
import { ShortBannerType } from "@models/banners/ShortBannerType.js";
import { BannerEntity } from "@staticModels/banners/BannerEntity.js";
import { RecordsModel } from "@staticModels/RecordsModel.js";

export class BannerRecords extends RecordsModel<BannerEntity> {

    public constructor(list: BannerEntity[]) {
        super(list, (entity) => entity.id, "BannerRecords");
    }

    public getBanner(id: string): Banner | null {
        let entity = this.get(id);

        if (!entity) {
            return null;
        }

        return new Banner(entity);
    }

    protected isValid(obj: BannerEntity): boolean {
        const isValid = ShortBannerType.isShortBannerType(obj.type)
            && DbBannerType.isDbBannerType(obj.dbType);

        if (!isValid) {
            throw new Error(`${this.namePrefix}Invalid banner entity: ${JSON.stringify(obj)}`);
        }

        return true;
    }
}