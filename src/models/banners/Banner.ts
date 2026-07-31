import { BannerType } from "@models/banners/BannerType";
import { DbBannerType } from "@models/banners/DbBannerType";
import { BannerEntity } from "@staticModels/banners/BannerEntity";
import { bannerRecords } from "@staticModels/instances";

export class Banner {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _type: BannerType;
    private readonly _dbType: DbBannerType;
    private readonly _startTime: string;
    private readonly _endTime?: string | null;
    private readonly _startTimeAsia?: string | null;
    private readonly _endTimeAsia?: string | null;
    private readonly _featured6List: string[];

    private readonly _featured6Set: Set<string>;

    constructor(bannerEntity: BannerEntity) {
        this._id = bannerEntity.id;
        this._name = bannerEntity.name;
        this._type = this.getBannerType(bannerEntity.type);
        this._dbType = this.getDbBannerType(bannerEntity.dbType);
        this._startTime = bannerEntity.startTime;
        this._endTime = bannerEntity.endTime;
        this._startTimeAsia = bannerEntity.startTimeAsia;
        this._endTimeAsia = bannerEntity.endTimeAsia;
        this._featured6List = bannerEntity.featured6;
        this._featured6Set = new Set(bannerEntity.featured6);
    }

    public static get(bannerId: string): Banner | null {
        return bannerRecords.getBanner(bannerId);
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get type(): BannerType {
        return this._type;
    }

    public get dbType(): DbBannerType {
        return this._dbType;
    }

    public get startTime(): string {
        return this._startTime;
    }

    public get endTime(): string | null {
        return this._endTime ?? null;
    }

    public get startTimeAsia(): string | null {
        return this._startTimeAsia ?? null;
    }

    public get endTimeAsia(): string | null {
        return this._endTimeAsia ?? null;
    }

    public get featured6List(): string[] {
        return this._featured6List ?? null;
    }

    public isFeatured(itemId: string): boolean {
        return this._featured6Set.has(itemId);
    }

    private getBannerType(str: string): BannerType {
        let bannerType = BannerType.getBannerTypeByShortName(str);

        if (!bannerType) {
            throw new Error(`Invalid banner type ${str}`);
        }

        return bannerType;
    }

    private getDbBannerType(str: string): DbBannerType {
        const isDbBannerType = DbBannerType.isDbBannerType(str);

        if (!isDbBannerType) {
            throw new Error(`Invalid banner dbType ${str}`);
        }

        return str;
    }
}