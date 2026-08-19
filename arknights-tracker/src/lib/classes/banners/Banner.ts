import { ApiBannerType } from "$lib/classes/banners/ApiBannerType";
import type { BannerGameData } from "$lib/classes/banners/BannerGameData";
import type { BannerItemData } from "$lib/classes/banners/BannerItemData";
import { GameBannerType } from "$lib/classes/banners/GameBannerType";
import { type BannerData, banners } from "$lib/data/banners";
import { bannersGameData } from "$lib/data/bannersGameData";
import { getMap, getMappedList } from "$lib/utils/collectionUtils";

export class Banner {
    private static readonly _list: readonly Banner[] = this.getBannerList();

    private static readonly _byId: Map<string, Banner> = getMap(this._list, item => item.id);
    private static readonly _byGameId: Map<string, Banner> = getMap(this._list, item => item.gameId);
    private static readonly _byGameType: Map<string, readonly Banner[]> = getMappedList(this._list, item => item.gameType);
    private static readonly _byApiType: Map<string, readonly Banner[]> = getMappedList(this._list, item => item.apiType);

    private readonly _id: string;
    private readonly _gameId: string;
    private readonly _name: string;
    private readonly _gameType: GameBannerType;
    private readonly _apiType: ApiBannerType;
    private readonly _startTime: Date;
    private readonly _startTimeAsia: Date | null;
    private readonly _endTime: Date | null;
    private readonly _endTimeAsia: Date | null;
    private readonly _version: string;
    private readonly _isServerTime: boolean;
    private readonly _timezone: string;
    private readonly _icon: string;
    private readonly _miniIcon: string;
    private readonly _url: string;
    private readonly _layer: number | null;
    private readonly _color: string;
    private readonly _iconPosition: number;
    private readonly _showOnMain: boolean;

    private readonly _featuredSet: Set<string>;
    private readonly _hardGuaranteedSet: Set<string>;
    private readonly _allowedMap: Map<string, BannerItemData>;

    private constructor(gameData: BannerGameData, data: BannerData) {
        if (!ApiBannerType.isApiBannerType(gameData.dbType)) {
            throw new Error(`BannerGameData.dbType is not ApiBannerType: ${gameData.dbType}`);
        }

        const gameType = GameBannerType.getByShortName(gameData.type);

        if (!gameType) {
            throw new Error(`BannerGameData.type is not short GameBannerType: ${gameData.type}`);
        }

        this._id = data.id;
        this._gameId = gameData.id;
        this._name = gameData.name;
        this._gameType = gameType;
        this._apiType = gameData.dbType;
        this._startTime = Banner.getDate(data.startTime);
        this._startTimeAsia = data.startTimeAsia ? Banner.getDate(data.startTimeAsia) : null;
        this._endTime = data.endTime ? Banner.getDate(data.endTime) : null;
        this._endTimeAsia = data.endTimeAsia ? Banner.getDate(data.endTimeAsia) : null;
        this._version = data.version;
        this._isServerTime = data.isServerTime;
        this._timezone = data.timezone;
        this._icon = data.icon;
        this._miniIcon = data.miniIcon;
        this._url = data.url;
        this._layer = data.layer;
        this._color = data.color;
        this._iconPosition = data.iconPosition;
        this._showOnMain = data.showOnMain;

        this._featuredSet = new Set(gameData.featured);
        this._hardGuaranteedSet = new Set(gameData.hardGuaranteed);
        this._allowedMap = getMap(gameData.allowed, item => item.itemId);
    }

    public static get list(): readonly Banner[] {
        return this._list;
    }

    public static getById(id: string): Banner | null {
        const data = this._byId.get(id);

        return data ?? null;
    }

    public static getByGameId(gameId: string): Banner | null {
        const data = this._byGameId.get(gameId);

        return data ?? null;
    }

    public static getListByGameType(gameType: GameBannerType): readonly Banner[] {
        const list = this._byGameType.get(gameType);

        return list ?? [];
    }

    public static getListByApiType(apiType: ApiBannerType): readonly Banner[] {
        const list = this._byApiType.get(apiType);

        return list ?? [];
    }

    private static getBannerList(): Banner[] {
        const gameBannerMap = getMap(bannersGameData, item => item.id);

        const result: Banner[] = [];

        for (const data of banners) {
            const gameData = gameBannerMap.get(data.gameId ?? data.id);

            if (!gameData) {
                throw new Error(`Game data for banner not found: ${data.gameId ?? data.id}`);
            }

            result.push(new Banner(gameData, data));
        }

        return result;
    }

    private static getDate(dateStr: string): Date {
        const [date, time] = dateStr.split(" ");

        return new Date(`${date}T${time}Z`);
    }

    private static formatDate(date: Date, locale: string): string {
        try {
            return new Intl.DateTimeFormat(locale, {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit"
            }).format(date);
        } catch (e) {
            const y = String(date.getFullYear()).slice(-2);
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${d}.${m}.${y}`;
        }
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

    public get startTimeAsia(): Date | null {
        return this._startTimeAsia;
    }

    public get endTime(): Date | null {
        return this._endTime;
    }

    public get endTimeAsia(): Date | null {
        return this._endTimeAsia;
    }

    public get gameId(): string {
        return this._gameId;
    }

    public get version(): string {
        return this._version;
    }

    public get isServerTime(): boolean {
        return this._isServerTime;
    }

    public get timezone(): string {
        return this._timezone;
    }

    public get icon(): string {
        return this._icon;
    }

    public get miniIcon(): string {
        return this._miniIcon;
    }

    public get url(): string {
        return this._url;
    }

    public get layer(): number | null {
        return this._layer;
    }

    public get color(): string {
        return this._color;
    }

    public get iconPosition(): number {
        return this._iconPosition;
    }

    public get showOnMain(): boolean {
        return this._showOnMain;
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

    public getFormattedStartTime(locale?: string): string {
        const loc = locale === "my" ? "ms-MY" : locale ?? "en";

        return Banner.formatDate(this._startTime, loc);
    }

    public getFormattedEndTime(locale?: string): string | null {
        if (this._endTime === null) {
            return null;
        }

        const loc = locale === "my" ? "ms-MY" : locale ?? "en";

        return Banner.formatDate(this._endTime, loc);
    }
}