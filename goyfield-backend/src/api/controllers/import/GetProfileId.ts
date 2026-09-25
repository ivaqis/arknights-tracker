import { database } from "@/serviceInstances.js";
import { GetProfileIdQuery } from "@api/contracts/import/GetProfileIdQuery.js";
import { GetProfileIdResponse } from "@api/contracts/import/GetProfileIdResponse.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import e from "express";

export class GetProfileId extends Controller<
    {},
    GetProfileIdResponse,
    undefined,
    GetProfileIdQuery
> {
    public readonly name: string = "GetProfileId";

    private readonly _database: Database = database;

    private readonly _privateId: string;

    public constructor(req: e.Request<{}, ResponseBody<GetProfileIdResponse>, undefined, GetProfileIdQuery>, res: e.Response<ResponseBody<GetProfileIdResponse>>) {
        super(req, res);

        this._privateId = req.query.privateId;
    }

    protected async execute(): Promise<void> {
        const profile = await this._database.userBannerProfiles.findUserBannerProfileByPrivateId(this._privateId);

        if (!profile) {
            this.status = 404;
            this.message = "Not Found";

            return;
        }

        this.data = {
            profile: {
                publicId: profile.publicId,
                privateId: profile.privateId
            }
        };
    }
}