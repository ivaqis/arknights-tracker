import { ContractFetcher } from "@services/contractFetcher/ContractFetcher";
import { ContractData } from "@services/contractFetcher/contracts/ContractData";
import { ContractRecordFetcher } from "@services/contractRecordFetcher/ContractRecordFetcher";
import { ContractRecordDetailData } from "@services/contractRecordFetcher/contracts/ContractRecordDetailData";
import { MonumentGroupData } from "@services/monumentFetcher/contracts/MonumentGroupData";
import { MonumentFetcher } from "@services/monumentFetcher/MonumentFetcher";
import { CredData } from "@services/skportAuth/contracts/CredData";
import { GryphlineAuthenticator } from "@services/skportAuth/GryphlineAuthenticator";
import { SkportAuthenticator } from "@services/skportAuth/SkportAuthenticator";
import { RoleData } from "@services/skportBindingFetcher/contracts/RoleData";
import { SkportBindingFetcher } from "@services/skportBindingFetcher/SkportBindingFetcher";
import { DetailData } from "@services/skportDetailFetcher/contracts/DetailData";
import { SkportDetailFetcher } from "@services/skportDetailFetcher/SkportDetailFetcher";

export class EndfieldDataFetcher {
    private readonly _authToken: string;
    private readonly _credData: CredData;
    private readonly _roles: Map<string, RoleData>;

    private constructor(authToken: string, credData: CredData, roles: Map<string, RoleData>) {
        this._authToken = authToken;
        this._credData = credData;
        this._roles = roles;
    }

    public static async create(authToken: string): Promise<EndfieldDataFetcher | null> {
        const gryphAuth = await GryphlineAuthenticator.authenticate(authToken);

        if (!gryphAuth) {
            return null;
        }

        const credData = await SkportAuthenticator.authenticate(gryphAuth.code);

        if (!credData) {
            return null;
        }

        const roles = await SkportBindingFetcher.getEndfieldRoles(credData);

        if (!roles || !roles.length) {
            return null;
        }

        return new EndfieldDataFetcher(authToken, credData, this.getRolesMap(roles));
    }

    private static getRolesMap(roles: RoleData[]) {
        const map = new Map<string, RoleData>();

        for (const role of roles) {
            map.set(role.serverId, role);
        }

        return map;
    }

    public get authToken(): string {
        return this._authToken;
    }

    public get credData(): CredData {
        return this._credData;
    }

    public get roles(): Map<string, RoleData> {
        return this._roles;
    }

    public async getDetailData(serverId: string): Promise<DetailData | null> {
        const role = this.getRole(serverId);

        if (!role) return null;

        return await SkportDetailFetcher.getDetailData(role, this._credData);
    }

    public async getContractData(serverId: string, contractApiId: string): Promise<ContractData | null> {
        const role = this.getRole(serverId);

        if (!role) return null;

        return await ContractFetcher.getContractData(role, this._credData, contractApiId);
    }

    public async getContractRecordData(serverId: string, contractApiId: string, recordId: string): Promise<ContractRecordDetailData | null> {
        const role = this.getRole(serverId);

        if (!role) return null;

        return await ContractRecordFetcher.getContractRecordDetail(role, this._credData, contractApiId, recordId);
    }

    public async getMonumentData(serverId: string): Promise<MonumentGroupData[] | null> {
        const role = this.getRole(serverId);

        if (!role) return null;

        return await MonumentFetcher.getMonumentGroupDataList(role, this._credData);
    }

    public getRole(serverId: string): RoleData | null {
        const role = this._roles.get(serverId);

        return role ?? null;
    }
}