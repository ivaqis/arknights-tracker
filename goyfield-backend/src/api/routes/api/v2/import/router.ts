import { database } from "@/serviceInstances.js";
import { Controller } from "@api/controllers/Controller.js";
import { GetImport } from "@api/controllers/import/GetImport.js";
import { GetProfileId } from "@api/controllers/import/GetProfileId.js";
import { PostImport } from "@api/controllers/import/PostImport.js";
import { SyncImport } from "@api/controllers/import/SyncImport.js";
import { StreamController } from "@api/controllers/StreamController.js";
import { generalLimiter } from "@api/middleware/rateLimiters/generalLimiter.js";
import { importLimiter } from "@api/middleware/rateLimiters/importLimiter.js";
import { RequireService } from "@api/middleware/RequireService.js";
import { GetImportRequestValidator } from "@api/middleware/validators/import/GetImportRequestValidator.js";
import { GetProfileIdRequestValidator } from "@api/middleware/validators/import/GetProfileIdRequestValidator.js";
import { PostImportRequestValidator } from "@api/middleware/validators/import/PostImportRequestValidator.js";
import { SyncImportRequestValidator } from "@api/middleware/validators/import/SyncImportRequestValidator.js";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator.js";
import { RequestValidator } from "@api/middleware/validators/RequestValidator.js";
import { Router } from "express";

export const importRouter = Router();

importRouter.get("/",
    importLimiter,
    RequestValidator.with(GetImportRequestValidator),
    StreamController.with(GetImport)
);
importRouter.post("/",
    importLimiter,
    RequireService.require(database),
    JsonRequestValidator.isJson,
    RequestValidator.with(PostImportRequestValidator),
    StreamController.with(PostImport)
);
importRouter.post("/sync",
    generalLimiter,
    RequireService.require(database),
    JsonRequestValidator.isJson,
    RequestValidator.with(SyncImportRequestValidator),
    Controller.with(SyncImport)
);
importRouter.get("/profile-id",
    generalLimiter,
    RequireService.require(database),
    RequestValidator.with(GetProfileIdRequestValidator),
    Controller.with(GetProfileId)
);