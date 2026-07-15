import { DeleteGameAccount } from "@api/controllers/gameAccount/DeleteGameAccount";
import {
    DeleteGameAccountRequestValidator
} from "@api/middleware/validators/gameAccount/DeleteGameAccountRequestValidator";
import { Router } from "express";

export const gameAccountRouter = Router();

gameAccountRouter.delete("/delete", DeleteGameAccountRequestValidator.validate, DeleteGameAccount.delete);