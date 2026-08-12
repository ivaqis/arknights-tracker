import { avatarUploader, sightengine } from "@/serviceInstances.js";
import { CreateUserProfile } from "@api/controllers/userProfile/CreateUserProfile.js";
import { DeleteUserProfile } from "@api/controllers/userProfile/DeleteUserProfile.js";
import { GetUserProfile } from "@api/controllers/userProfile/GetUserProfile.js";
import { UpdateUserProfile } from "@api/controllers/userProfile/UpdateUserProfile.js";
import { RequireAuth } from "@api/middleware/RequireAuth.js";
import { RequireService } from "@api/middleware/RequireService.js";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator.js";
import {
    CreateUserProfileRequestValidator
} from "@api/middleware/validators/userProfile/CreateUserProfileRequestValidator.js";
import {
    DeleteUserProfileRequestValidator
} from "@api/middleware/validators/userProfile/DeleteUserProfileRequestValidator.js";
import { GetUserProfileRequestValidator } from "@api/middleware/validators/userProfile/GetUserProfileRequestValidator.js";
import {
    UpdateUserProfileRequestValidator
} from "@api/middleware/validators/userProfile/UpdateUserProfileRequestValidator.js";
import { AuthType } from "@services/auth/AuthType.js";
import { Router } from "express";

export const profileRouter = Router();

profileRouter.get("/get",
    GetUserProfileRequestValidator.validate,
    GetUserProfile.get
);
profileRouter.post("/update",
    JsonRequestValidator.isJson,
    RequireAuth.require(AuthType.FIREBASE),
    UpdateUserProfileRequestValidator.validate,
    UpdateUserProfile.post
);
profileRouter.post("/create",
    // RequireService.require(sightengine, avatarUploader), // todo ВКЛЮЧИТЬ
    RequireAuth.require(AuthType.FIREBASE),
    JsonRequestValidator.isJson,
    CreateUserProfileRequestValidator.validate,
    CreateUserProfile.post
);
profileRouter.delete("/delete",
    RequireService.require(avatarUploader),
    RequireAuth.require(AuthType.FIREBASE),
    DeleteUserProfileRequestValidator.validate,
    DeleteUserProfile.delete
);