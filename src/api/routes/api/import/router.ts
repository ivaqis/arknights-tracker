import { database } from "@/serviceInstances";
import { GetImport } from "@api/controllers/import/GetImport";
import { PostImport } from "@api/controllers/import/PostImport";
import { StreamController } from "@api/controllers/StreamController";
import { RequireService } from "@api/middleware/RequireService";
import { GetImportRequestValidator } from "@api/middleware/validators/import/GetImportRequestValidator";
import { PostImportRequestValidator } from "@api/middleware/validators/import/PostImportRequestValidator";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const importRouter = Router();

importRouter.get("/",
    RequestValidator.with(GetImportRequestValidator),
    StreamController.with(GetImport));
importRouter.post("/",
    RequireService.require(database),
    JsonRequestValidator.isJson,
    RequestValidator.with(PostImportRequestValidator),
    StreamController.with(PostImport));
importRouter.post("/sync",
    RequireService.require(database),
    JsonRequestValidator.isJson); // todo