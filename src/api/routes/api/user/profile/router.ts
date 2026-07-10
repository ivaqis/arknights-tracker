import { GetUserProfile } from "@api/controllers/userProfile/GetUserProfile";
import {
    UserProfileQueryRequestValidator
} from "@api/middleware/validators/userProfile/UserProfileQueryRequestValidator";
import { Router } from "express";

export const profileRouter = Router();

profileRouter.get("/", UserProfileQueryRequestValidator.validate, GetUserProfile.get);
profileRouter.post("/");