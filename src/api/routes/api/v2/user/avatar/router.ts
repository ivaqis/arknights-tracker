import { avatarUploader, sightengine } from "@/serviceInstances";
import { DeleteAvatar } from "@api/controllers/uploadAvatar/DeleteAvatar";
import { UploadAvatar } from "@api/controllers/uploadAvatar/UploadAvatar";
import { RequireAuth } from "@api/middleware/RequireAuth";
import { RequireService } from "@api/middleware/RequireService";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator";
import { DeleteAvatarRequestValidator } from "@api/middleware/validators/uploadAvatar/DeleteAvatarRequestValidator";
import { UploadAvatarRequestValidator } from "@api/middleware/validators/uploadAvatar/UploadAvatarRequestValidator";
import { AuthType } from "@services/auth/AuthType";
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