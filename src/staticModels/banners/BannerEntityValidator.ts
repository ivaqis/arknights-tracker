import { BannerType } from "@models/banners/BannerType";
import { DbBannerType } from "@models/banners/DbBannerType";
import { ListValidationRule } from "@models/validation/ListValidationRule";
import { OptionalValidationRule } from "@models/validation/OptionalValidationRule";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";
import { BannerEntity } from "@staticModels/banners/BannerEntity";

export class BannerEntityValidator extends Validator<BannerEntity> {
    private static readonly AVAILABLE_TYPES: string[] = ["standard", "new-player", "special", "joint", "weapon"];

    constructor(entity: BannerEntity) {
        super(entity, BannerEntityValidator.getRules());
    }

    private static getRules(): ValidationRule<BannerEntity>[] {
        return [
            BannerEntityValidator.getIdRule(),
            BannerEntityValidator.getNameRule(),
            BannerEntityValidator.getTypeRule(),
            BannerEntityValidator.getDbTypeRule(),
            BannerEntityValidator.getStartTimeRule(),
            BannerEntityValidator.getEndTimeRule(),
            BannerEntityValidator.getStartTimeAsiaRule(),
            BannerEntityValidator.getEndTimeAsiaRule(),
            BannerEntityValidator.getFeatured6Rule()
        ];
    }

    private static getIdRule(): ValidationRule<BannerEntity> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.id),
            "id must be a not-empty string"
        );
    }

    private static getNameRule(): ValidationRule<BannerEntity> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.name),
            "name must be a not-empty string"
        );
    }

    private static getTypeRule(): ValidationRule<BannerEntity> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.type) && !!BannerType.getBannerTypeByShortName(item.type),
            `type must be one of ${BannerEntityValidator.AVAILABLE_TYPES}`
        );
    }

    private static getDbTypeRule(): ValidationRule<BannerEntity> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.dbType) && DbBannerType.isDbBannerType(item.dbType),
            `dbType must be one of ${DbBannerType.getValues()}`
        );
    }

    private static getStartTimeRule(): ValidationRule<BannerEntity> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.startTime),
            "startTime must be a not-empty string"
        );
    }

    private static getEndTimeRule(): ValidationRule<BannerEntity> {
        const rule = new OptionalValidationRule(new StringValidationRule(true));

        return new ValidationRule(
            item => rule.isValid(item.endTime),
            "endTime must be a not-empty string or null or undefined"
        );
    }

    private static getStartTimeAsiaRule(): ValidationRule<BannerEntity> {
        const rule = new OptionalValidationRule(new StringValidationRule(true));

        return new ValidationRule(
            item => rule.isValid(item.startTimeAsia),
            "startTimeAsia must be a not-empty string or null or undefined"
        );
    }

    private static getEndTimeAsiaRule(): ValidationRule<BannerEntity> {
        const rule = new OptionalValidationRule(new StringValidationRule(true));

        return new ValidationRule(
            item => rule.isValid(item.endTimeAsia),
            "endTimeAsia must be a not-empty string or null or undefined"
        );
    }

    private static getFeatured6Rule(): ValidationRule<BannerEntity> {
        const eachRule = new StringValidationRule(true);
        const rule = new ListValidationRule(eachRule);

        return new ValidationRule(
            item => rule.isValid(item.featured6),
            "featured6 must be a list of not-empty strings"
        );
    }
}