import { URLRequestParams } from "@models/urlParams/URLRequestParams.js";
import { SkportDetailURLParams } from "@services/skportDetailFetcher/contracts/SkportDetailURLParams.js";

export class DetailRequestParams extends URLRequestParams {
    private readonly _roleId: string;
    private readonly _serverId: string;

    public constructor(urlParams: SkportDetailURLParams) {
        super();

        this._roleId = urlParams.roleId;
        this._serverId = urlParams.serverId;
    }

    public get roleId(): string {
        return this._roleId;
    }

    public get serverId(): string {
        return this._serverId;
    }

    protected getInitParams(): Record<string, string> {
        return {
            roleId: this._roleId,
            serverId: this._serverId,
        };
    }
}