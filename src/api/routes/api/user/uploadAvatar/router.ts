import { avatarUploader, sightengine } from "@/serviceInstances";
import { UploadAvatar } from "@api/controllers/uploadAvatar/UploadAvatar";
import { RequireService } from "@api/middleware/RequireService";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator";
import { UploadAvatarRequestValidator } from "@api/middleware/validators/uploadAvatar/UploadAvatarRequestValidator";
import { Router } from "express";

export const uploadAvatarRouter = Router();

uploadAvatarRouter.use(RequireService.require(avatarUploader, sightengine));

uploadAvatarRouter.post("/", JsonRequestValidator.isJson, UploadAvatarRequestValidator.validate, UploadAvatar.post);