import { InvalidBannerEntityError } from "@errors/InvalidBannerEntityError";
import { Banner } from "@models/banners/Banner";
import { BannerEntity } from "@staticModels/banners/BannerEntity";
import { BannerEntityValidator } from "@staticModels/banners/BannerEntityValidator";
import { RecordsModel } from "@staticModels/RecordsModel";

export class BannerRecords extends RecordsModel<BannerEntity> {

    private constructor(list: BannerEntity[]) {
        super(list, (entity) => entity.id);
    }

    public getBanner(id: string): Banner | null {
        let entity = this.get(id);

        if (!entity) {
            return null;
        }

        return new Banner(entity);
    }

    protected isValid(obj: BannerEntity): boolean {
        let validator = new BannerEntityValidator(obj);

        if (validator.messages.length > 0) {
            throw new InvalidBannerEntityError(obj, ...validator.messages);
        }

        return validator.isValid;
    }
}