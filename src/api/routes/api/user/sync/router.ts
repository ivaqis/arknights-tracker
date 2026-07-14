import { SyncProfile } from "@api/controllers/syncProfile/SyncProfile";
import { SyncProfileRequestValidator } from "@api/middleware/validators/syncProfile/SyncProfileRequestValidator";
import { Router } from "express";

export const syncRouter = Router();

syncRouter.post("/", SyncProfileRequestValidator.validate, SyncProfile.post);