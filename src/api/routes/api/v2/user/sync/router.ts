import { SyncProfile } from "@api/controllers/syncProfile/SyncProfile";
import { RequireAuth } from "@api/middleware/RequireAuth";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator";
import { SyncProfileRequestValidator } from "@api/middleware/validators/syncProfile/SyncProfileRequestValidator";
import { AuthType } from "@services/auth/AuthType";
import { Router } from "express";

export const syncRouter = Router();

syncRouter.post("/",
    JsonRequestValidator.isJson,
    RequireAuth.require(AuthType.FIREBASE),
    SyncProfileRequestValidator.validate,
    SyncProfile.post
);