import { database } from "@/serviceInstances";
import { Controller } from "@api/controllers/Controller";
import { GetImport } from "@api/controllers/import/GetImport";
import { GetProfileId } from "@api/controllers/import/GetProfileId";
import { PostImport } from "@api/controllers/import/PostImport";
import { SyncImport } from "@api/controllers/import/SyncImport";
import { StreamController } from "@api/controllers/StreamController";
import { RequireService } from "@api/middleware/RequireService";
import { GetImportRequestValidator } from "@api/middleware/validators/import/GetImportRequestValidator";
import { GetProfileIdRequestValidator } from "@api/middleware/validators/import/GetProfileIdRequestValidator";
import { PostImportRequestValidator } from "@api/middleware/validators/import/PostImportRequestValidator";
import { SyncImportRequestValidator } from "@api/middleware/validators/import/SyncImportRequestValidator";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const importRouter = Router();

importRouter.get("/",
    RequestValidator.with(GetImportRequestValidator),
    StreamController.with(GetImport)
);
importRouter.post("/",
    RequireService.require(database),
    JsonRequestValidator.isJson,
    RequestValidator.with(PostImportRequestValidator),
    StreamController.with(PostImport)
);
importRouter.post("/sync",
    RequireService.require(database),
    JsonRequestValidator.isJson,
    RequestValidator.with(SyncImportRequestValidator),
    Controller.with(SyncImport)
);
importRouter.get("/profile-id",
    RequireService.require(database),
    RequestValidator.with(GetProfileIdRequestValidator),
    Controller.with(GetProfileId)
);