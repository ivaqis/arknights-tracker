import { DeleteGameAccount } from "@api/controllers/gameAccount/DeleteGameAccount.js";
import { RequireAuth } from "@api/middleware/RequireAuth.js";
import {
    DeleteGameAccountRequestValidator
} from "@api/middleware/validators/gameAccount/DeleteGameAccountRequestValidator.js";
import { AuthType } from "@services/auth/AuthType.js";
import { Router } from "express";

export const gameAccountRouter = Router();

gameAccountRouter.delete("/delete",
    RequireAuth.require(AuthType.FIREBASE),
    DeleteGameAccountRequestValidator.validate,
    DeleteGameAccount.delete
);