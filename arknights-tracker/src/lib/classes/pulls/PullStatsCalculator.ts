import type { BannerData } from "$lib/data/banners";
import { banners } from "$lib/data/banners";
import { characters } from "$lib/data/characters";
import { weapons } from "$lib/data/weapons";
import type { BannerStatsResult, MileageData, PullRecord } from "$lib/classes/pulls/PullTypes";
import { PullDateHelper } from "$lib/classes/pulls/PullDateHelper";
import { PullNameCanonicalizer } from "$lib/classes/pulls/PullNameCanonicalizer";
import { PullParser } from "$lib/classes/pulls/PullParser";

export class PullStatsCalculator {
    private readonly _pulls: PullRecord[];
    private readonly _bannerId: string;
    private readonly _serverId: string | null;
    private readonly _isWeaponType: boolean;
    private readonly _isJointType: boolean;

    private _count6 = 0;
    private _count5 = 0;
    private _sumPity6 = 0;
    private _sumPity5 = 0;
    private _won5050 = 0;
    private _total5050 = 0;
    private _hasReceivedRateUp = false;
    private _currentPity6 = 0;
    private _currentPity5 = 0;
    private _currentBannerMileage = 0;
    private _mileageStart = 0;
    private _mileageEnd = 0;

    private readonly _bannerSpecificCounts: Record<string, number> = {};
    private readonly _rateUpCounters: Record<string, number> = {};

    private constructor(pulls: PullRecord[], bannerId: string, accountServerId: string | null = null) {
        this._pulls = [...pulls].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        this._bannerId = bannerId;
        this._serverId = accountServerId;
        this._isWeaponType = PullParser.isWeaponBanner(bannerId);
        this._isJointType = bannerId.includes("joint");
    }

    public static calculate(pulls: PullRecord[], bannerId: string, accountServerId: string | null = null): BannerStatsResult {
        const calculator = new PullStatsCalculator(pulls, bannerId, accountServerId);
        return calculator.execute();
    }

    private execute(): BannerStatsResult {
        const viewBanner = this.resolveViewBanner();
        this.initMileageBounds(viewBanner);

        const hardPityLimit = (this._isWeaponType || this._isJointType) ? 80 : 120;

        for (const pull of this._pulls) {
            this.processPull(pull, viewBanner, hardPityLimit);
        }

        return this.buildResult(viewBanner);
    }

    private resolveViewBanner(): BannerData | undefined {
        let viewBanner = banners.find(b => b.id === this._bannerId);
        if (viewBanner || (!this._bannerId.includes("special") && !this._isWeaponType && !this._isJointType)) {
            return viewBanner;
        }

        const candidates = banners.filter(b => {
            if (this._isWeaponType) return b.type === "weapon" || PullParser.isWeaponBanner(b.id);
            if (this._isJointType) return b.type === "joint" || b.id?.includes("joint");
            return b.type === "special";
        });

        candidates.sort((a, b) => {
            const aStart = PullDateHelper.parseDateWithServer(PullDateHelper.getBannerDates(a, this._serverId).startStr, this._serverId)?.getTime() || 0;
            const bStart = PullDateHelper.parseDateWithServer(PullDateHelper.getBannerDates(b, this._serverId).startStr, this._serverId)?.getTime() || 0;
            return bStart - aStart;
        });

        const lastPullTime = this._pulls.length > 0 ? new Date(this._pulls.at(-1)!.time).getTime() : Date.now();
        const active = candidates.find(b => {
            const start = PullDateHelper.parseDateWithServer(PullDateHelper.getBannerDates(b, this._serverId).startStr, this._serverId)?.getTime() || 0;
            return start <= lastPullTime;
        });

        return active || candidates[0];
    }

    private initMileageBounds(viewBanner: BannerData | undefined): void {
        if (!viewBanner) return;
        const dates = PullDateHelper.getBannerDates(viewBanner, this._serverId);
        this._mileageStart = PullDateHelper.parseDateWithServer(dates.startStr, this._serverId)?.getTime() || 0;
        const endDate = dates.endStr ? PullDateHelper.parseDateWithServer(dates.endStr, this._serverId) : null;
        this._mileageEnd = endDate ? endDate.getTime() : Infinity;
    }

    private processPull(pull: PullRecord, viewBanner: BannerData | undefined, hardPityLimit: number): void {
        const uniqueKey = PullDateHelper.getDistinctBannerId(pull, this._serverId);
        this._bannerSpecificCounts[uniqueKey] = (this._bannerSpecificCounts[uniqueKey] || 0);
        this._rateUpCounters[uniqueKey] = (this._rateUpCounters[uniqueKey] || 0);

        const isFree = this.isPullFree(pull, uniqueKey);
        this._bannerSpecificCounts[uniqueKey]++;

        if (isFree) {
            return;
        }

        const isHardPityTriggered = this._rateUpCounters[uniqueKey] >= hardPityLimit - 1;
        this._rateUpCounters[uniqueKey]++;

        const pullTime = new Date(pull.time).getTime();
        this.updateMileageProgress(pullTime);

        if (pull.rarity === 6) {
            this.handle6Star(pull, uniqueKey, viewBanner, pullTime, isHardPityTriggered);
        } else if (pull.rarity === 5) {
            this.handle5Star();
        } else {
            this._currentPity6++;
            this._currentPity5++;
        }
    }

    private isPullFree(pull: PullRecord, uniqueKey: string): boolean {
        if (typeof pull.isFree === "boolean") {
            return pull.isFree;
        }
        const count = this._bannerSpecificCounts[uniqueKey];
        const isEligibleBanner = (this._bannerId.includes("special") && !this._isWeaponType) || this._isJointType;
        return isEligibleBanner && count >= 30 && count < 40;
    }

    private updateMileageProgress(pullTime: number): void {
        const isStandardOrNew = this._bannerId.includes("standard") || this._bannerId.includes("new");
        const isWithinMileageWindow = pullTime >= this._mileageStart && pullTime <= this._mileageEnd;
        if (isStandardOrNew || isWithinMileageWindow) {
            this._currentBannerMileage++;
        }
    }

    private handle6Star(
        pull: PullRecord,
        uniqueKey: string,
        viewBanner: BannerData | undefined,
        pullTime: number,
        isHardPityTriggered: boolean
    ): void {
        this._count6++;
        this._sumPity6 += this._currentPity6 + 1;

        const itemName = PullNameCanonicalizer.normalize(pull.name);
        const isFeatured = this.checkIfFeatured(itemName, uniqueKey, viewBanner, pull.time, pull.rawPoolId);

        if (isFeatured) {
            if (!isHardPityTriggered) {
                this._won5050++;
                this._total5050++;
                pull.status = "won";
            } else {
                pull.status = "guaranteed";
                pull.isGuaranteed = true;
            }

            this._rateUpCounters[uniqueKey] = 0;
            if (pullTime >= this._mileageStart && pullTime <= this._mileageEnd) {
                this._hasReceivedRateUp = true;
            }
        } else {
            this._total5050++;
            pull.status = "lost";
        }

        this._currentPity6 = 0;
        this._currentPity5 = 0;
    }

    private checkIfFeatured(
        itemName: string,
        uniqueKey: string,
        viewBanner: BannerData | undefined,
        time: Date,
        rawPoolId?: string
    ): boolean {
        let historic = banners.find(b => b.id === uniqueKey);
        historic ??= PullDateHelper.findBannerConfigByTime(time, rawPoolId, this._serverId);
        const featuredList = historic?.featured6 || viewBanner?.featured6 || [];

        return featuredList.some(fid => {
            const c = characters[fid];
            if (c && PullNameCanonicalizer.normalize(c.name) === itemName) return true;
            const w = weapons[fid];
            if (w && PullNameCanonicalizer.normalize(w.name) === itemName) return true;
            return PullNameCanonicalizer.normalize(fid) === itemName;
        });
    }

    private handle5Star(): void {
        this._count5++;
        this._sumPity5 += this._currentPity5 + 1;
        this._currentPity5 = 0;
        this._currentPity6++;
    }

    private calculateMileage(): MileageData {
        if (this._bannerId.includes("standard")) {
            return {
                show: this._currentBannerMileage < 300,
                current: this._currentBannerMileage,
                max: 300,
                label: "selector_6"
            };
        }
        if (this._isWeaponType) {
            return this.calculateWeaponMileage();
        }
        if (this._isJointType) {
            return { show: true, current: this._currentBannerMileage, max: 120, label: "selector_6" };
        }
        if (this._bannerId.includes("special")) {
            const isBonusCopy = this._hasReceivedRateUp || this._currentBannerMileage >= 120;
            return {
                show: true,
                current: isBonusCopy ? this._currentBannerMileage % 240 : this._currentBannerMileage,
                max: isBonusCopy ? 240 : 120,
                label: isBonusCopy ? "bonus_copy_6" : "guaranteed_6"
            };
        }
        return { show: false, current: 0, max: 0, label: "" };
    }

    private calculateWeaponMileage(): MileageData {
        if (this._bannerId.includes("constant")) {
            return { show: false, current: 0, max: 0, label: "" };
        }
        if (this._currentBannerMileage < 100) {
            return { show: true, current: this._currentBannerMileage, max: 100, label: "arms_offering" };
        }
        const offset = this._currentBannerMileage - 100;
        const phase = Math.floor(offset / 80);
        const nextTarget = 100 + (phase + 1) * 80;
        const isFeaturedNext = phase % 2 === 0;
        return {
            show: true,
            current: this._currentBannerMileage,
            max: nextTarget,
            label: isFeaturedNext ? "featured_guarantee" : "arms_offering"
        };
    }

    private buildResult(viewBanner: BannerData | undefined): BannerStatsResult {
        const total = this._pulls.length;
        const activeRateUp = (viewBanner && this._rateUpCounters[viewBanner.id] !== undefined)
            ? this._rateUpCounters[viewBanner.id]
            : (this._rateUpCounters[this._bannerId] || 0);

        return {
            total,
            pity6: this._currentPity6,
            pity5: this._currentPity5,
            mileage: this.calculateMileage(),
            guarantee120: this._hasReceivedRateUp ? 0 : activeRateUp,
            hasReceivedRateUp: this._hasReceivedRateUp,
            count6: this._count6,
            count5: this._count5,
            avg6: this._count6 ? (this._sumPity6 / this._count6).toFixed(1) : "0.0",
            avg5: this._count5 ? (this._sumPity5 / this._count5).toFixed(1) : "0.0",
            percent6: total ? ((this._count6 / total) * 100).toFixed(2) : "0.00",
            percent5: total ? ((this._count5 / total) * 100).toFixed(2) : "0.00",
            winRate: {
                won: this._won5050,
                total: this._total5050,
                percent: this._total5050 ? ((this._won5050 / this._total5050) * 100).toFixed(1) : 0
            }
        };
    }
}
