import { ApiBannerType } from "$lib/classes/banners/ApiBannerType";
import type { BannerGameData } from "$lib/classes/banners/BannerGameData";
import type { BannerItemData } from "$lib/classes/banners/BannerItemData";
import { GameBannerType } from "$lib/classes/banners/GameBannerType";
import { bannersGameData } from "$lib/data/bannersGameData";
import { getMap, getMappedList } from "$lib/utils/collectionUtils";

export class Banner {
    private static readonly byId: Map<string, BannerGameData> = getMap(bannersGameData, item => item.id);
    private static readonly byType: Map<string, readonly BannerGameData[]> = getMappedList(bannersGameData, item => item.type);
    private static readonly byApiType: Map<string, readonly BannerGameData[]> = getMappedList(bannersGameData, item => item.dbType);

    private readonly _id: string;
    private readonly _name: string;
    private readonly _gameType: GameBannerType;
    private readonly _apiType: ApiBannerType;
    private readonly _startTime: Date;
    private readonly _startTimeAsia: Date;
    private readonly _endTime: Date | null;
    private readonly _endTimeAsia: Date | null;

    private readonly _featuredSet: Set<string>;
    private readonly _hardGuaranteedSet: Set<string>;
    private readonly _allowedMap: Map<string, BannerItemData>;

    private constructor(data: BannerGameData) {
        if (!ApiBannerType.isApiBannerType(data.dbType)) {
            throw new Error(`BannerGameData.dbType is not ApiBannerType: ${data.dbType}`);
        }

        const gameType = GameBannerType.getByShortName(data.type);

        if (!gameType) {
            throw new Error(`BannerGameData.type is not short GameBannerType: ${data.type}`);
        }

        this._id = data.id;
        this._name = data.name;
        this._gameType = gameType;
        this._apiType = data.dbType;
        this._startTime = Banner.getDate(data.startTime);
        this._startTimeAsia = Banner.getDate(data.startTimeAsia);
        this._endTime = data.endTime ? Banner.getDate(data.endTime) : null;
        this._endTimeAsia = data.endTimeAsia ? Banner.getDate(data.endTimeAsia) : null;

        this._featuredSet = new Set(data.featured);
        this._hardGuaranteedSet = new Set(data.hardGuaranteed);
        this._allowedMap = getMap(data.allowed, item => item.itemId);
    }

    public static getById(id: string): Banner | null {
        const data = this.byId.get(id);

        if (!data) {
            return null;
        }

        return new Banner(data);
    }

    public static getListByGameType(gameType: GameBannerType): Banner[] {
        const list = this.byType.get(gameType);

        if (!list) {
            return [];
        }

        return list.map(item => new Banner(item));
    }

    public static getListByApiType(apiType: ApiBannerType): Banner[] {
        const list = this.byApiType.get(apiType);

        if (!list) {
            return [];
        }

        return list.map(item => new Banner(item));
    }

    private static getDate(dateStr: string): Date {
        const [date, time] = dateStr.split(" ");

        return new Date(`${date}T${time}Z`);
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get gameType(): GameBannerType {
        return this._gameType;
    }

    public get apiType(): ApiBannerType {
        return this._apiType;
    }

    public get startTime(): Date {
        return this._startTime;
    }

    public get startTimeAsia(): Date {
        return this._startTimeAsia;
    }

    public get endTime(): Date | null {
        return this._endTime;
    }

    public get endTimeAsia(): Date | null {
        return this._endTimeAsia;
    }

    public getFeaturedList(): string[] {
        return [...this._featuredSet];
    }

    public getHardGuaranteeList(): string[] {
        return [...this._hardGuaranteedSet];
    }

    public getAllowedList(): BannerItemData[] {
        return [...this._allowedMap.values()];
    }

    public isFeatured(itemId: string): boolean {
        return this._featuredSet.has(itemId);
    }

    public isHardGuarantee(itemId: string): boolean {
        return this._hardGuaranteedSet.has(itemId);
    }

    public isAllowed(itemId: string, rarity?: number) {
        const item = this._allowedMap.get(itemId);

        if (!item) {
            return false;
        }

        return rarity === undefined ? true : rarity === item.rarity;
    }
}