import { errorsRouter } from "@api/routes/api/admin/errors/router";
import { Router } from "express";

export const adminRouter = Router();

adminRouter.use("/errors", errorsRouter);