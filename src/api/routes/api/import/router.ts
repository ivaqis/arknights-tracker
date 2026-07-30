import { database } from "@/serviceInstances";
import { GetImport } from "@api/controllers/import/GetImport";
import { StreamController } from "@api/controllers/StreamController";
import { RequireService } from "@api/middleware/RequireService";
import { GetImportRequestValidator } from "@api/middleware/validators/import/GetImportRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const importRouter = Router();

importRouter.use(RequireService.require(database));

importRouter.get("/", RequestValidator.with(GetImportRequestValidator), StreamController.with(GetImport));
// importRouter.post("/"); // todo
// importRouter.post("/sync"); // todo