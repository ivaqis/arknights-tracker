import { Banner } from "@models/banners/Banner";
import { BannerType } from "@models/banners/BannerType";
import { Validator } from "@models/Validator";
import { BannerEntity } from "@staticModels/banners/BannerEntity";
import { isOptionalString, isString, isValidList } from "@utils/validationUtils";

export class BannerEntityValidator extends Validator<BannerEntity> {
    private static readonly AVAILABLE_TYPES: string[] = ["standard", "new-player", "special", "joint", "weapon"];

    constructor(entity: BannerEntity) {
        super(entity);
    }
    
    protected validate(): boolean {
        let id = this.idCheck();
        let name = this.nameCheck();
        let type = this.typeCheck();
        let startTime = this.startTimeCheck();
        let endTime = this.endTimeCheck();
        let startTimeAsia = this.startTimeAsiaCheck();
        let endTimeAsia = this.endTimeAsiaCheck();
        let featured6 = this.featured6Check();

        return id
            && name
            && type
            && startTime
            && endTime
            && startTimeAsia
            && endTimeAsia
            && featured6;
    }

    private idCheck(): boolean {
        if (!isString(this._entity.id)) {
            this._messages.push("id must be a not-empty string");
            return false;
        }

        return true;
    }

    private nameCheck(): boolean {
        if (!isString(this._entity.name)) {
            this._messages.push("name must be a not-empty string");
            return false;
        }

        return true;
    }

    private typeCheck(): boolean {
        let field = this._entity.type;

        if (!(isString(field) && BannerType.getBannerTypeByShortName(field))) {
            this._messages.push(`type must be one of ${BannerEntityValidator.AVAILABLE_TYPES}`);
            return false;
        }

        return true;
    }

    private startTimeCheck(): boolean {
        if (!isString(this._entity.startTime)) {
            this._messages.push("startTime must be a not-empty string");
            return false;
        }

        return true;
    }

    private endTimeCheck(): boolean {
        if (!isOptionalString(this._entity.endTime)) {
            this._messages.push("endTime must be a not-empty string or null or undefined");
            return false;
        }

        return true;
    }

    private startTimeAsiaCheck(): boolean {
        if (!isOptionalString(this._entity.startTimeAsia)) {
            this._messages.push("startTimeAsia must be a not-empty string or null or undefined");
            return false;
        }

        return true;
    }

    private endTimeAsiaCheck(): boolean {
        if (!isOptionalString(this._entity.endTimeAsia)) {
            this._messages.push("endTimeAsia must be a not-empty string or null or undefined");
            return false;
        }

        return true;
    }

    private featured6Check(): boolean {
        if (!isValidList(this._entity.featured6, isString)) {
            this._messages.push("featured6 must be a list of not-empty strings");
            return false;
        }

        return true;
    }
}