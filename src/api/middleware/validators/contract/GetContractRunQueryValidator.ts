import { GetContractRunQuery } from "@api/contracts/contract/GetContractRunQuery";
import { StringValidationRule } from "@models/validation/StringValidationRule";
import { ValidationRule } from "@models/validation/ValidationRule";
import { Validator } from "@models/validation/Validator";

export class GetContractRunQueryValidator extends Validator<GetContractRunQuery> {

    public constructor(item: GetContractRunQuery) {
        super(item, GetContractRunQueryValidator.getRules());
    }

    private static getRules(): ValidationRule<GetContractRunQuery>[] {
        return [
            this.getFirebaseRule(),
            this.getRecordIdRule()
        ];
    }

    private static getFirebaseRule(): ValidationRule<GetContractRunQuery> {
        const rule = new StringValidationRule();

        return new ValidationRule(
            item => rule.isValid(item.firebaseToken),
            "firebaseToken must be a string"
        );
    }

    private static getRecordIdRule(): ValidationRule<GetContractRunQuery> {
        const rule = new StringValidationRule(true);

        return new ValidationRule(
            item => rule.isValid(item.recordId),
            "recordId must be a string"
        );
    }
}