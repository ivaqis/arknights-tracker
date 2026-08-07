import { adminRouter } from "@api/routes/api/v2/admin/router.js";
import { globalRouter } from "@api/routes/api/v2/global/router.js";
import { importRouter } from "@api/routes/api/v2/import/router.js";
import { leaderboardRouter } from "@api/routes/api/v2/leaderboard/router.js";
import { rankingsRouter } from "@api/routes/api/v2/rankings/router.js";
import { userRouter } from "@api/routes/api/v2/user/router.js";
import { Router } from "express";

export const apiV2Router = Router();

apiV2Router.use("/leaderboard", leaderboardRouter);
apiV2Router.use("/user", userRouter);
apiV2Router.use("/admin", adminRouter);
apiV2Router.use("/global", globalRouter);
apiV2Router.use("/import", importRouter);
apiV2Router.use("/rankings", rankingsRouter);