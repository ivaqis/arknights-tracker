import { avatarUploader, sightengine } from "@/serviceInstances";
import { DeleteAvatar } from "@api/controllers/uploadAvatar/DeleteAvatar";
import { UploadAvatar } from "@api/controllers/uploadAvatar/UploadAvatar";
import { RequireService } from "@api/middleware/RequireService";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator";
import { DeleteAvatarRequestValidator } from "@api/middleware/validators/uploadAvatar/DeleteAvatarRequestValidator";
import { UploadAvatarRequestValidator } from "@api/middleware/validators/uploadAvatar/UploadAvatarRequestValidator";
import { Router } from "express";

export const avatarRouter = Router();

avatarRouter.use(RequireService.require(avatarUploader, sightengine));

avatarRouter.post("/upload", JsonRequestValidator.isJson, UploadAvatarRequestValidator.validate, UploadAvatar.post);
avatarRouter.delete("/delete", DeleteAvatarRequestValidator.validate, DeleteAvatar.delete);