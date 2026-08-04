import { Database } from "@database/Database";
import { UserBannerTypeStatEntity } from "@database/entities/UserBannerTypeStatEntity";
import { BannerStats } from "@models/banners/BannerStats";
import { DbBannerType } from "@models/banners/DbBannerType";
import { ExcludeRange } from "@models/ExcludeRange";
import { BannerTypeStatEntity } from "@models/pullProfile/entities/BannerTypeStatEntity";
import { EventBannerTypeStatEntity } from "@models/pullProfile/entities/EventBannerTypeStatEntity";
import { PullProfileEntity } from "@models/pullProfile/entities/PullProfileEntity";

export class PullProfileSearcher {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public static getRating(allCount: number, gteCount: number, lteCount: number): ExcludeRange {
        const gtCount = allCount - lteCount;
        const ltCount = allCount - gteCount;

        return {
            from: ltCount / allCount,
            to: 1 - (gtCount / allCount)
        };
    }

    public static sumBannerTypeStats(...stats: UserBannerTypeStatEntity[]): BannerStats {
        const result: BannerStats = {
            unfreePulls: 0,
            total6: 0,
            total5: 0,
            won5050: 0,
            total5050: 0,
            freePulls: 0,
            free6: 0,
            free5: 0,
            freeWin5050: 0
        };

        for (const item of stats) {
            result.unfreePulls += item.unfreePulls;
            result.total6 += item.total6;
            result.total5 += item.total5;
            result.won5050 += item.won5050;
            result.total5050 += item.total5050;
            result.freePulls += item.freePulls;
            result.free6 += item.free6;
            result.free5 += item.free5;
            result.freeWin5050 += item.freeWin5050;
        }

        return result;
    }

    public async getPullProfile(profileId: bigint): Promise<PullProfileEntity | null> {
        const profile = await this._database.userBannerProfiles.findUserBannerProfile(profileId);

        if (!profile) {
            return null;
        }

        const beginner = await this._database.userBannerStats.getBannerTypeStats(profileId, DbBannerType.CHAR_BEGINNER);
        const standard = await this._database.userBannerStats.getBannerTypeStats(profileId, DbBannerType.CHAR_STANDARD);
        const special = await this._database.userBannerStats.getBannerTypeStats(profileId, DbBannerType.CHAR_SPECIAL);
        const joint = await this._database.userBannerStats.getBannerTypeStats(profileId, DbBannerType.CHAR_JOINT);
        const weaponStandard = await this._database.userBannerStats.getBannerTypeStats(profileId, DbBannerType.WEAPON_STANDARD);
        const weaponSpecial = await this._database.userBannerStats.getBannerTypeStats(profileId, DbBannerType.WEAPON_SPECIAL);

        const all = PullProfileSearcher.sumBannerTypeStats(beginner, standard, special, joint, weaponStandard, weaponSpecial);

        const allStats = await this.getEventBannerTypeStats(null, all.unfreePulls + all.freePulls, all.total5050, all.won5050, all.total6, all.total5);
        const specialStats = await this.getEventBannerTypeStats(DbBannerType.CHAR_SPECIAL, special.unfreePulls + special.freePulls, special.total5050, special.won5050, special.total6, special.total5);
        const jointStats = await this.getEventBannerTypeStats(DbBannerType.CHAR_JOINT, joint.unfreePulls + joint.freePulls, joint.total5050, joint.won5050, joint.total6, joint.total5);
        const weaponSpecialStats = await this.getEventBannerTypeStats(DbBannerType.WEAPON_SPECIAL, weaponSpecial.unfreePulls, weaponSpecial.total5050, weaponSpecial.won5050, weaponSpecial.total6, weaponSpecial.total5);
        const weaponStandardStats = await this.getEventBannerTypeStats(DbBannerType.WEAPON_STANDARD, weaponStandard.unfreePulls, weaponStandard.total5050, weaponStandard.won5050, weaponStandard.total6, weaponStandard.total5);

        const beginnerStats = await this.getBannerTypeStats(DbBannerType.CHAR_BEGINNER, beginner.unfreePulls, beginner.total6, beginner.total5);
        const standardStats = await this.getBannerTypeStats(DbBannerType.CHAR_STANDARD, standard.unfreePulls, standard.total6, standard.total5);

        return {
            profileId: profile.publicId,
            stats: {
                all: allStats,
                [DbBannerType.CHAR_SPECIAL]: specialStats,
                [DbBannerType.CHAR_JOINT]: jointStats,
                [DbBannerType.CHAR_STANDARD]: standardStats,
                [DbBannerType.CHAR_BEGINNER]: beginnerStats,
                [DbBannerType.WEAPON_SPECIAL]: weaponSpecialStats,
                [DbBannerType.WEAPON_STANDARD]: weaponStandardStats
            }
        };
    }

    public async getBannerTypeStats(bannerType: DbBannerType | null,
                                    totalPulls: number,
                                    total6: number,
                                    total5: number,
                                    countMe: boolean = false
    ): Promise<BannerTypeStatEntity | null> {
        if (totalPulls === 0) {
            return null;
        }

        const winRate6 = total6 / totalPulls;
        const winRate5 = total5 / totalPulls;

        const ratingStats = await this._database.userBannerStats.getRatingStats(bannerType, totalPulls, total6, total5, 0, 0);

        let allUsers = ratingStats.totalUsers;
        if (countMe) {
            allUsers++;
        }

        const pullsRating = PullProfileSearcher.getRating(allUsers, ratingStats.gteTotalPulls, ratingStats.lteTotalPulls);
        const luck6Rating = PullProfileSearcher.getRating(allUsers, ratingStats.gteLuck6Ratio, ratingStats.lteLuck6Ratio);
        const luck5Rating = PullProfileSearcher.getRating(allUsers, ratingStats.gteLuck5Ratio, ratingStats.lteLuck5Ratio);

        return {
            totalPulls: {
                count: totalPulls,
                rating: pullsRating
            },
            luck6: total6 === 0
                ? null
                : {
                    avg: totalPulls / total6,
                    rating: luck6Rating
                },
            luck5: total5 === 0
                ? null
                : {
                    avg: totalPulls / total5,
                    rating: luck5Rating
                }
        };
    }

    public async getEventBannerTypeStats(bannerType: DbBannerType.EVENT | null,
                                         totalPulls: number,
                                         total5050: number,
                                         won5050: number,
                                         total6: number,
                                         total5: number,
                                         countMe: boolean = false
    ): Promise<EventBannerTypeStatEntity | null> {
        if (totalPulls === 0) {
            return null;
        }

        const winRate6 = total6 / totalPulls;
        const winRate5 = total5 / totalPulls;
        const winRate5050 = total5050 > 0 ? won5050 / total5050 : null;

        const ratingStats = await this._database.userBannerStats.getRatingStats(bannerType, totalPulls, total6, total5, total5050, won5050);

        let allUsers = ratingStats.totalUsers;
        if (countMe) {
            allUsers++;
        }

        let all5050users = ratingStats.total5050Users;
        if (countMe) {
            all5050users++;
        }

        const pullsRating = PullProfileSearcher.getRating(allUsers, ratingStats.gteTotalPulls, ratingStats.lteTotalPulls);
        const luck6Rating = PullProfileSearcher.getRating(allUsers, ratingStats.gteLuck6Ratio, ratingStats.lteLuck6Ratio);
        const luck5Rating = PullProfileSearcher.getRating(allUsers, ratingStats.gteLuck5Ratio, ratingStats.lteLuck5Ratio);
        const win5050Rating = PullProfileSearcher.getRating(all5050users, ratingStats.gteWin5050Ratio, ratingStats.lteWin5050Ratio);

        return {
            totalPulls: {
                count: totalPulls,
                rating: pullsRating
            },
            luck6: total6 === 0
                ? null
                : {
                    avg: totalPulls / total6,
                    rating: luck6Rating
                },
            luck5: total5 === 0
                ? null
                : {
                    avg: totalPulls / total5,
                    rating: luck5Rating
                },
            luck5050: winRate5050 === null
                ? null
                : {
                    winRate: winRate5050,
                    rating: win5050Rating
                }
        };
    }

}