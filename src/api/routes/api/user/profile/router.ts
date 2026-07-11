import { GetUserProfile } from "@api/controllers/userProfile/GetUserProfile";
import { UpdateUserProfile } from "@api/controllers/userProfile/UpdateUserProfile";
import { GetUserProfileRequestValidator } from "@api/middleware/validators/userProfile/GetUserProfileRequestValidator";
import {
    UpdateUserProfileRequestValidator
} from "@api/middleware/validators/userProfile/UpdateUserProfileRequestValidator";
import { Router } from "express";

export const profileRouter = Router();

profileRouter.get("/get", GetUserProfileRequestValidator.validate, GetUserProfile.get);
profileRouter.post("/update", UpdateUserProfileRequestValidator.validate, UpdateUserProfile.post);
profileRouter.post("/create");
profileRouter.delete("/delete");