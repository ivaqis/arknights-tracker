import { SyncProfile } from "@api/controllers/syncProfile/SyncProfile";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator";
import { SyncProfileRequestValidator } from "@api/middleware/validators/syncProfile/SyncProfileRequestValidator";
import { Router } from "express";

export const syncRouter = Router();

syncRouter.post("/", JsonRequestValidator.isJson, SyncProfileRequestValidator.validate, SyncProfile.post);