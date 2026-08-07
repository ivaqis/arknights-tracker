import { BannerType } from "@models/banners/BannerType.js";
import { DbBannerType } from "@models/banners/DbBannerType.js";
import { BannerEntity } from "@staticModels/banners/BannerEntity.js";
import { BannerItemEntity } from "@staticModels/banners/BannerItemEntity.js";
import { bannerRecords } from "@staticModels/instances.js";

export class Banner {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _type: BannerType;
    private readonly _dbType: DbBannerType;
    private readonly _startTime: string;
    private readonly _endTime: string | null;
    private readonly _startTimeAsia: string;
    private readonly _endTimeAsia: string | null;

    private readonly _featuredSet: Set<string>;
    private readonly _hardGuaranteedSet: Set<string>;
    private readonly _allowedMap: Map<string, BannerItemEntity>;

    constructor(bannerEntity: BannerEntity) {
        this._id = bannerEntity.id;
        this._name = bannerEntity.name;
        this._type = Banner.getBannerType(bannerEntity.type);
        this._dbType = Banner.getDbBannerType(bannerEntity.dbType);
        this._startTime = bannerEntity.startTime;
        this._endTime = bannerEntity.endTime;
        this._startTimeAsia = bannerEntity.startTimeAsia;
        this._endTimeAsia = bannerEntity.endTimeAsia;

        this._featuredSet = new Set(bannerEntity.featured);
        this._hardGuaranteedSet = new Set(bannerEntity.hardGuaranteed);
        this._allowedMap = Banner.getAllowedMap(bannerEntity.allowed);
    }

    public static get(bannerId: string): Banner | null {
        return bannerRecords.getBanner(bannerId);
    }

    private static getAllowedMap(allowed: BannerItemEntity[]): Map<string, BannerItemEntity> {
        const map = new Map<string, BannerItemEntity>();

        for (const item of allowed) {
            map.set(item.itemId, item);
        }

        return map;
    }

    private static getBannerType(str: string): BannerType {
        let bannerType = BannerType.getBannerTypeByShortName(str);

        if (!bannerType) {
            throw new Error(`Invalid banner type ${str}`);
        }

        return bannerType;
    }

    private static getDbBannerType(str: string): DbBannerType {
        const isDbBannerType = DbBannerType.isDbBannerType(str);

        if (!isDbBannerType) {
            throw new Error(`Invalid banner dbType ${str}`);
        }

        return str;
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

    public get startTimeAsia(): string {
        return this._startTimeAsia;
    }

    public get endTimeAsia(): string | null {
        return this._endTimeAsia ?? null;
    }

    public isFeatured(itemId: string): boolean {
        return this._featuredSet.has(itemId);
    }

    public isHardGuaranteed(itemId: string): boolean {
        return this._hardGuaranteedSet.has(itemId);
    }

    public isAllowed(itemId: string, rarity?: number) {
        if (rarity === undefined) {
            return this._allowedMap.has(itemId);
        }

        const item = this._allowedMap.get(itemId);

        if (!item) {
            return false;
        }

        return item.rarity === rarity;
    }
}