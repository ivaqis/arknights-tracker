import { Banner } from "@models/banners/Banner";
import { BannerEntity } from "@staticModels/banners/BannerEntity";
import { RecordsModel } from "@staticModels/RecordsModel";

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
        return true;
    }
}