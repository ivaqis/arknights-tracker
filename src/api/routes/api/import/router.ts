import { database } from "@/serviceInstances";
import { Import } from "@api/controllers/import/Import";
import { RequireService } from "@api/middleware/RequireService";
import { ImportRequestValidator } from "@api/middleware/validators/import/ImportRequestValidator";
import { JsonRequestValidator } from "@api/middleware/validators/JsonRequestValidator";
import { RequestValidator } from "@api/middleware/validators/RequestValidator";
import { Router } from "express";

export const importRouter = Router();

importRouter.use(RequireService.require(database));

importRouter.post("/", JsonRequestValidator.isJson, RequestValidator.with(ImportRequestValidator), Import.post);
// importRouter.post("/sync"); // todo