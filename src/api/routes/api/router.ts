import { adminRouter } from "@api/routes/api/admin/router";
import { globalRouter } from "@api/routes/api/global/router";
import { importRouter } from "@api/routes/api/import/router";
import { leaderboardRouter } from "@api/routes/api/leaderboard/router";
import { rankingsRouter } from "@api/routes/api/rankings/router";
import { userRouter } from "@api/routes/api/user/router";
import { Router } from "express";

export const apiRouter = Router();

apiRouter.use("/leaderboard", leaderboardRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/global", globalRouter);
apiRouter.use("/import", importRouter);
apiRouter.use("/rankings", rankingsRouter);