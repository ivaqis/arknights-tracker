import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";
import { ItemNameEntity } from "@staticModels/itemNames/ItemNameEntity";

export class ItemNameEntityValidator extends Validator<ItemNameEntity> {
    public constructor(item: ItemNameEntity) {
        super(item, ItemNameEntityValidator.getRules());
    }

    private static getRules(): ValidationRule<ItemNameEntity>[] {
        return [
            this.getIdRule(),
            this.getNameRule()
        ]
    }

    private static getIdRule(): ValidationRule<ItemNameEntity> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.id),
            "id must be a not-empty string"
        );
    }

    private static getNameRule(): ValidationRule<ItemNameEntity> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.name),
            "name must be a not-empty string"
        )
    }
}