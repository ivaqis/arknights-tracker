import { InvalidBannerEntityError } from "@errors/InvalidBannerEntityError";
import { BannerEntity } from "@staticModels/banners/BannerEntity";
import { BannerEntityValidator } from "@staticModels/banners/BannerEntityValidator";
import { RecordsModel } from "@staticModels/RecordsModel";

export class BannerRecords extends RecordsModel<BannerEntity> {

    private constructor(list: BannerEntity[]) {
        super(list, (entity) => entity.id);
    }

    protected isValid(obj: BannerEntity): boolean {
        let validator = new BannerEntityValidator(obj);

        if (validator.messages.length > 0) {
            throw new InvalidBannerEntityError(obj, ...validator.messages);
        }

        return validator.isValid;
    }
}