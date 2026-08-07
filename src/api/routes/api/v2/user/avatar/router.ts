import { avatarUploader, sightengine } from "@/serviceInstances.js";
import { DeleteAvatar } from "@api/controllers/uploadAvatar/DeleteAvatar.js";
import { UploadAvatar } from "@api/controllers/uploadAvatar/UploadAvatar.js";
import { RequireAuth } from "@api/middleware/RequireAuth.js";
import { RequireService } from "@api/middleware/RequireService.js";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator.js";
import { DeleteAvatarRequestValidator } from "@api/middleware/validators/uploadAvatar/DeleteAvatarRequestValidator.js";
import { UploadAvatarRequestValidator } from "@api/middleware/validators/uploadAvatar/UploadAvatarRequestValidator.js";
import { AuthType } from "@services/auth/AuthType.js";
import { Router } from "express";

export const avatarRouter = Router();

avatarRouter.use(RequireService.require(avatarUploader, sightengine));

avatarRouter.post("/upload",
    JsonRequestValidator.isJson,
    RequireAuth.require(AuthType.FIREBASE),
    UploadAvatarRequestValidator.validate,
    UploadAvatar.post
);
avatarRouter.delete("/delete",
    RequireAuth.require(AuthType.FIREBASE),
    DeleteAvatarRequestValidator.validate,
    DeleteAvatar.delete
);