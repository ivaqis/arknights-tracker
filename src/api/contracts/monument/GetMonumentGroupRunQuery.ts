import { BooleanString } from "@models/validation/BooleanStringValidationRule";

export interface GetMonumentGroupRunQuery {
    firebaseToken: string;
    gameUid: string;
    groupId: string;
    isHard: BooleanString;
}