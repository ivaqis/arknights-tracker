import { GetUserProfile } from "@api/controllers/userProfile/GetUserProfile";
import {
    GetUserProfileRequestValidator
} from "@api/middleware/validators/userProfile/GetUserProfileRequestValidator";
import { Router } from "express";

export const profileRouter = Router();

profileRouter.get("/", GetUserProfileRequestValidator.validate, GetUserProfile.get);
profileRouter.post("/");