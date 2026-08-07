import { SyncProfile } from "@api/controllers/syncProfile/SyncProfile.js";
import { RequireAuth } from "@api/middleware/RequireAuth.js";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator.js";
import { SyncProfileRequestValidator } from "@api/middleware/validators/syncProfile/SyncProfileRequestValidator.js";
import { AuthType } from "@services/auth/AuthType.js";
import { Router } from "express";

export const syncRouter = Router();

syncRouter.post("/",
    JsonRequestValidator.isJson,
    RequireAuth.require(AuthType.FIREBASE),
    SyncProfileRequestValidator.validate,
    SyncProfile.post
);