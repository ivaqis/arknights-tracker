import { avatarUploader, sightengine } from "@/serviceInstances";
import { CreateUserProfile } from "@api/controllers/userProfile/CreateUserProfile";
import { DeleteUserProfile } from "@api/controllers/userProfile/DeleteUserProfile";
import { GetUserProfile } from "@api/controllers/userProfile/GetUserProfile";
import { UpdateUserProfile } from "@api/controllers/userProfile/UpdateUserProfile";
import { RequireService } from "@api/middleware/RequireService";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator";
import {
    CreateUserProfileRequestValidator
} from "@api/middleware/validators/userProfile/CreateUserProfileRequestValidator";
import {
    DeleteUserProfileRequestValidator
} from "@api/middleware/validators/userProfile/DeleteUserProfileRequestValidator";
import { GetUserProfileRequestValidator } from "@api/middleware/validators/userProfile/GetUserProfileRequestValidator";
import {
    UpdateUserProfileRequestValidator
} from "@api/middleware/validators/userProfile/UpdateUserProfileRequestValidator";
import { Router } from "express";

export const profileRouter = Router();

profileRouter.get("/get",
    GetUserProfileRequestValidator.validate,
    GetUserProfile.get
);
profileRouter.post("/update",
    JsonRequestValidator.isJson,
    UpdateUserProfileRequestValidator.validate,
    UpdateUserProfile.post
);
profileRouter.post("/create",
    // RequireService.require(sightengine, avatarUploader),
    JsonRequestValidator.isJson,
    CreateUserProfileRequestValidator.validate,
    CreateUserProfile.post
);
profileRouter.delete("/delete",
    RequireService.require(avatarUploader),
    DeleteUserProfileRequestValidator.validate,
    DeleteUserProfile.delete
);