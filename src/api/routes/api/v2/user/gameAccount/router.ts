import { DeleteGameAccount } from "@api/controllers/gameAccount/DeleteGameAccount";
import { RequireAuth } from "@api/middleware/RequireAuth";
import {
    DeleteGameAccountRequestValidator
} from "@api/middleware/validators/gameAccount/DeleteGameAccountRequestValidator";
import { AuthType } from "@services/auth/AuthType";
import { Router } from "express";

export const gameAccountRouter = Router();

gameAccountRouter.delete("/delete",
    RequireAuth.require(AuthType.FIREBASE),
    DeleteGameAccountRequestValidator.validate,
    DeleteGameAccount.delete
);