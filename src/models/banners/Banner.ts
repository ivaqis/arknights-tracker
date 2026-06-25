import { BannerType } from "@models/banners/BannerType";
import { BannerEntity } from "@staticModels/banners/BannerEntity";
import { bannerRecords } from "@staticModels/instances";

export class Banner {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _type: BannerType;
    private readonly _startTime: string;
    private readonly _endTime?: string | null;
    private readonly _startTimeAsia?: string | null;
    private readonly _endTimeAsia?: string | null;
    private readonly _featured6List: string[];

    constructor(bannerEntity: BannerEntity) {
        let bannerType = Banner.getBannerType(bannerEntity.type);

        if (!bannerType) {
            throw new Error(`Invalid banner type ${bannerEntity.type}`);
        }

        this._id = bannerEntity.id;
        this._name = bannerEntity.name;
        this._type = bannerType;
        this._startTime = bannerEntity.startTime;
        this._endTime = bannerEntity.endTime;
        this._startTimeAsia = bannerEntity.startTimeAsia;
        this._endTimeAsia = bannerEntity.endTimeAsia;
        this._featured6List = bannerEntity.featured6;
    }

    public static get(bannerId: string): Banner | null {
        return bannerRecords.getBanner(bannerId);
    }

    public static getBannerType(bannerType: string): BannerType | null {
        switch (bannerType) {
            case "standard": return BannerType.CHAR_STANDARD;
            case "new-player": return BannerType.CHAR_BEGINNER;
            case "special": return BannerType.CHAR_SPECIAL;
            case "joint": return BannerType.CHAR_JOINT;
            case "weapon": return BannerType.WEAPON;
            default: return null;
        }
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
}