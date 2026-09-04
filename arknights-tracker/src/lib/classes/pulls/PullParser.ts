import type { PullRecord } from "$lib/classes/pulls/PullTypes";
import { PullDateHelper } from "$lib/classes/pulls/PullDateHelper";
import { PullNameCanonicalizer } from "$lib/classes/pulls/PullNameCanonicalizer";
import { characters } from "$lib/data/characters";
import { weapons } from "$lib/data/weapons";
import LZString from "lz-string";

export class PullParser {
    public static isWeaponBanner(rawId: string | number | null | undefined): boolean {
        if (!rawId) return false;
        const id = String(rawId).toLowerCase().trim();
        return id.includes("weap") || id.includes("wepon") || id.includes("constant") || id.includes("scathe");
    }

    public static getInternalBannerType(rawId: string | number | null | undefined): string {
        if (!rawId) {
            return "standard";
        }

        const id = String(rawId).toLowerCase().trim();

        if (id.includes("joint")) {
            return "joint";
        }

        if (this.isWeaponBanner(rawId)) {
            return String(rawId);
        }

        if (id === "2" || id.includes("beginner") || id.includes("new") || id.includes("novice")) {
            return "new-player";
        }

        if (id === "1" || id.includes("standard") || id.includes("permanent")) {
            return "standard";
        }

        return "special";
    }

    public static getWeaponCategory(bannerId: string | null | undefined): string {
        if (!bannerId) {
            return "other";
        }

        const id = String(bannerId).toLowerCase();

        if (id.includes("constant") || (id.includes("standard") && id.includes("weapon"))) {
            return "weap-standard";
        }

        if (this.isWeaponBanner(bannerId)) {
            return "weap-special";
        }

        return "other";
    }

    public static normalizeBannerKey(key: string | null | undefined): string {
        if (!key) return "standard";
        const k = String(key).trim();
        if (k === "E_CharacterGachaPoolType_Special" || k === "special") return "special";
        if (k === "E_CharacterGachaPoolType_Joint" || k === "joint") return "joint";
        if (k === "E_CharacterGachaPoolType_Standard" || k === "standard") return "standard";
        if (k === "E_CharacterGachaPoolType_Beginner" || k === "beginner" || k === "new-player") return "new-player";
        if (k === "Weapon" || k === "weapon" || k === "weapon-all") return "weapon-all";
        if (k === "weapStandard" || k === "weap-standard") return "weapStandard";
        if (k === "weapSpecial" || k === "weap-special") return "weapSpecial";
        return k;
    }

    public static buildImportUrl(token: string, server: string): string {
        const encodedToken = encodeURIComponent(decodeURIComponent(token));
        return `https://ef-webview.gryphline.com/page/gacha_weapon?pool_id=weaponbox_constant_2&u8_token=${encodedToken}&platform=Android&channel=6&subChannel=6&lang=ru-ru&server=${server}`;
    }

    public static resolveItemInfo(
        itemId?: string | null,
        defaultType: string = "character",
        defaultRarity: number = 4,
        defaultName: string = ""
    ): { name: string; type: string; rarity: number } {
        const id = itemId || "";
        let type = defaultType;
        if (id.startsWith("chr_")) type = "character";
        else if (id.startsWith("wpn_")) type = "weapon";

        let name = defaultName || id;
        let rarity = Number(defaultRarity || 4);

        if (type === "character") {
            const charKey = Object.keys(characters).find((k) => characters[k].gameId === id);
            if (charKey && characters[charKey]) {
                name = characters[charKey].name;
                rarity = characters[charKey].rarity;
            }
        } else {
            const wpnKey = Object.keys(weapons).find((k) => weapons[k].gameId === id);
            if (wpnKey && weapons[wpnKey]) {
                name = weapons[wpnKey].name;
                rarity = weapons[wpnKey].rarity;
            }
        }
        return { name, type, rarity };
    }

    public static normalizeThirdPartyPull(item: any): PullRecord {
        const itemId = item.charId || item.weaponId || item.itemId || item.item_id || "";
        const defaultName = item.charName || item.weaponName || item.itemName || itemId;
        const defaultType = item.recordType || (itemId.startsWith("wpn_") ? "weapon" : "character");
        const { name, type, rarity } = this.resolveItemInfo(itemId, defaultType, item.rarity, defaultName);

        const seqId = Number(item.seqId || item.sequence_id || item.sequence || 0);
        const dateObj = PullDateHelper.parseTimestamp(item.gachaTs || item.timestamp || item.ts || item.time);
        const rawBannerId = item.poolId || item.cardPoolType || "standard";
        const internalId = this.getInternalBannerType(rawBannerId);

        return {
            id: `${dateObj.getTime()}_${name}_${seqId}`,
            time: dateObj,
            name,
            rarity,
            bannerId: internalId,
            seqId,
            isNew: item.isNew === true || item.is_new === true,
            isFree: item.isFree === true || item.is_free === true,
            type,
            rawPoolId: rawBannerId
        };
    }

    public static normalizeThirdPartyPulls(rawList: any[]): PullRecord[] {
        if (!Array.isArray(rawList)) return [];
        return rawList
            .map(item => this.normalizeThirdPartyPull(item))
            .filter((p) => p.time.getFullYear() >= 2000)
            .sort(PullDateHelper.sortPulls);
    }

    public static parseEndminBackup(fileContent: string): PullRecord[] {
        let decompressed = "";
        try {
            decompressed = LZString.decompressFromUTF16(fileContent) || LZString.decompress(fileContent) || "";
        } catch {
            throw new Error("ENDMIN_DECOMPRESS_ERROR");
        }

        if (!decompressed) {
            throw new Error("ENDMIN_DECOMPRESS_ERROR");
        }

        let parsedData: any;
        try {
            parsedData = JSON.parse(decompressed);
        } catch {
            throw new Error("ENDMIN_DECOMPRESS_ERROR");
        }

        const profilesObj = parsedData?.profileData || {};
        const profileKeys = Object.keys(profilesObj);
        const selectedProfileKey = profileKeys.find((k) => k === "main") || profileKeys[0];

        if (!selectedProfileKey || !profilesObj[selectedProfileKey]) {
            throw new Error("ENDMIN_NO_PROFILES_ERROR");
        }

        const profile = profilesObj[selectedProfileKey];
        const pulls = profile?.pulls ? Object.values(profile.pulls).flat() : [];
        if (!pulls.length) {
            throw new Error("ENDMIN_NO_PULLS_ERROR");
        }

        return this.normalizeThirdPartyPulls(pulls);
    }

    public static parseProtorigBackup(fileContent: string): PullRecord[] {
        let parsedData: any;
        try {
            parsedData = JSON.parse(fileContent);
        } catch {
            throw new Error("PROTORIG_PARSE_ERROR");
        }

        const chars = (parsedData.characters || []).map((i: any) => ({ ...i, recordType: "character" }));
        const weaps = (parsedData.weapons || []).map((i: any) => ({ ...i, recordType: "weapon" }));
        const allPulls = [...chars, ...weaps];

        if (allPulls.length === 0) {
            throw new Error("PROTORIG_NO_PULLS_ERROR");
        }

        return this.normalizeThirdPartyPulls(allPulls);
    }

    public static parseToolsDevJson(jsonStr: string): PullRecord[] {
        let parsedData: any;
        try {
            parsedData = JSON.parse(jsonStr.trim());
        } catch {
            throw new Error("TOOLSDEV_PARSE_ERROR");
        }

        const records = parsedData?.data?.records;
        if (!Array.isArray(records) || records.length === 0) {
            throw new Error("TOOLSDEV_EMPTY_ERROR");
        }

        return this.normalizeThirdPartyPulls(records);
    }

    public static parseTrackMyPullsBackup(fileContent: string): PullRecord[] {
        let parsedData: any;
        try {
            parsedData = JSON.parse(fileContent);
        } catch {
            throw new Error("TRACKMYPULLS_PARSE_ERROR");
        }

        if (!parsedData || typeof parsedData !== "object" || !parsedData.data || !Array.isArray(parsedData.data.banners)) {
            throw new Error("TRACKMYPULLS_PARSE_ERROR");
        }

        const targetProfile = parsedData.data.gameProfiles?.endfield?.playerId;
        let banners = parsedData.data.banners.filter((b: any) => !b.game || b.game === "endfield");
        if (targetProfile && banners.some((b: any) => b.profile === targetProfile)) {
            banners = banners.filter((b: any) => b.profile === targetProfile);
        }

        const allPulls: PullRecord[] = [];
        for (const banner of banners) {
            if (!Array.isArray(banner.items)) continue;
            for (const item of banner.items) {
                if (!item || !item.n) continue;

                const rawName = PullNameCanonicalizer.canonicalize(item.n);
                const rarity = Number(item.q || 4);
                const itemType = item.c === "w" ? "weapon" : "character";
                const seqId = Number(item.si || 0);
                const dateObj = PullDateHelper.parseTimestamp(Number(item.t) || item.t);
                const rawPoolId = item.bi || (
                    banner.name === "beginner" ? "beginner" :
                    banner.name === "joint" ? "joint" :
                    banner.name === "special" ? "special" :
                    banner.name === "arsenal" ? "weapon" :
                    banner.name || "standard"
                );
                const bannerId = this.getInternalBannerType(rawPoolId);

                const uniqueId = seqId !== 0
                    ? `${dateObj.getTime()}_${rawName}_${seqId}`
                    : `${dateObj.getTime()}_${rawName}`;

                allPulls.push({
                    id: uniqueId,
                    time: dateObj,
                    name: rawName,
                    rarity,
                    bannerId,
                    seqId,
                    isNew: false,
                    isFree: item.if === true,
                    type: itemType,
                    rawPoolId
                });
            }
        }

        if (allPulls.length === 0) {
            throw new Error("TRACKMYPULLS_NO_PULLS_ERROR");
        }

        return allPulls
            .filter((p) => p.time.getFullYear() >= 2000)
            .sort(PullDateHelper.sortPulls);
    }

    public static parseGachaLog(list: any[]): PullRecord[] {
        if (!Array.isArray(list)) {
            throw new TypeError("Invalid data array");
        }

        const timeCounters: Record<string, number> = {};

        return list
            .filter(item => {
                if (!item) return false;
                const rawName = item.name || item.charName || item.weaponName || item.character || item.item_name;
                return rawName && rawName !== "undefined" && rawName !== "null";
            })
            .map((item) => {
                const rawName = PullNameCanonicalizer.canonicalize(
                    item.name || item.charName || item.weaponName || item.character || item.item_name
                );
                const rarity = Number(item.rarity || item.rank || item.rank_type);
                const seqId = Number(item.seqId || item.sequence || 0);
                const isNew = item.isNew === true || String(item.isNew) === "true" || item.is_new === true;
                const isFree = item.isFree === true || String(item.isFree) === "true";

                let dateObj: Date;
                if (item.gachaTs) {
                    dateObj = PullDateHelper.parseTimestamp(item.gachaTs);
                } else if (item.ts) {
                    dateObj = PullDateHelper.parseTimestamp(Number(item.ts) * 1000);
                } else if (item.time) {
                    dateObj = PullDateHelper.parseTimestamp(item.time);
                } else {
                    dateObj = new Date(0);
                }

                const rawBannerId = item.bannerId || item.poolId || item.gacha_type;
                const internalId = this.getInternalBannerType(rawBannerId);
                const itemType = item.weaponName ? "weapon" : "character";
                const tsStr = dateObj.getTime().toString();

                timeCounters[tsStr] ??= 0;
                const localIdx = timeCounters[tsStr]++;

                const uniqueId = item.id
                    || (seqId !== 0
                        ? `${dateObj.getTime()}_${rawName}_${seqId}`
                        : `${dateObj.getTime()}_${rawName}_loc${localIdx}`);

                return {
                    id: uniqueId,
                    time: dateObj,
                    name: rawName,
                    rarity,
                    bannerId: internalId,
                    seqId,
                    isNew,
                    isFree,
                    type: itemType,
                    rawPoolId: rawBannerId
                };
            })
            .sort(PullDateHelper.sortPulls);
    }
}

