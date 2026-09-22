import { BannerType } from "@models/banners/BannerType.js";
import { CharPull } from "@models/pulls/CharPull.js";
import { Pull } from "@models/pulls/Pull.js";
import { WeaponPull } from "@models/pulls/WeaponPull.js";
import { GroupedPullsByDate } from "@models/stablePullId/GroupedPullsByDate.js";
import { GroupedPullsByPeriod } from "@models/stablePullId/GroupedPullsByPeriod.js";
import { PeriodPulls } from "@models/stablePullId/PeriodPulls.js";
import { StablePullId } from "@models/stablePullId/StablePullId.js";
import { getDayOfWeekStartsWithMonday, getWeek } from "@utils/dateUtils.js";

export class StablePullPeriod {
    private readonly _periodNumber: number;
    private readonly _specialPulls: PeriodPulls<CharPull>;
    private readonly _jointPulls: PeriodPulls<CharPull>;
    private readonly _standardPulls: PeriodPulls<CharPull>;
    private readonly _beginnerPulls: PeriodPulls<CharPull>;
    private readonly _weaponPulls: PeriodPulls<WeaponPull>;
    private readonly _rerunPulls: PeriodPulls<CharPull>;

    private constructor(periodNumber: number,
                        specialPulls: PeriodPulls<CharPull>,
                        jointPulls: PeriodPulls<CharPull>,
                        standardPulls: PeriodPulls<CharPull>,
                        beginnerPulls: PeriodPulls<CharPull>,
                        weaponPulls: PeriodPulls<WeaponPull>,
                        rerunPulls: PeriodPulls<CharPull>,
    ) {
        this._periodNumber = periodNumber;
        this._specialPulls = specialPulls;
        this._jointPulls = jointPulls;
        this._standardPulls = standardPulls;
        this._beginnerPulls = beginnerPulls;
        this._weaponPulls = weaponPulls;
        this._rerunPulls = rerunPulls;
    }

    // todo тут где то должен быть баг что не обработан случай неполного периода когда он в конце
    public static create(specialPulls: CharPull[], jointPulls: CharPull[], standardPulls: CharPull[], beginnerPulls: CharPull[], weaponPulls: WeaponPull[], rerunPulls: CharPull[]): StablePullPeriod[] {
        const groupedPulls: GroupedPullsByDate = {
            [BannerType.CHAR_SPECIAL]: this.groupByDate(specialPulls),
            [BannerType.CHAR_JOINT]: this.groupByDate(jointPulls),
            [BannerType.CHAR_STANDARD]: this.groupByDate(standardPulls),
            [BannerType.CHAR_BEGINNER]: this.groupByDate(beginnerPulls),
            [BannerType.WEAPON]: this.groupByDate(weaponPulls),
            [BannerType.CHAR_RERUN]: this.groupByDate(rerunPulls)
        };

        const periods = this.groupByPeriod(groupedPulls);

        const current = this.getCurrentPeriodNumber();

        periods.delete(current);

        const result: StablePullPeriod[] = [];

        for (const [periodNumber, pulls] of periods.entries()) {
            const period = new StablePullPeriod(
                periodNumber,
                pulls[BannerType.CHAR_SPECIAL],
                pulls[BannerType.CHAR_JOINT],
                pulls[BannerType.CHAR_STANDARD],
                pulls[BannerType.CHAR_BEGINNER],
                pulls[BannerType.WEAPON],
                pulls[BannerType.CHAR_RERUN]
            );

            result.push(period);
        }

        result.sort((a, b) => b._periodNumber - a._periodNumber);

        return result;
    }

    public static getCurrentPeriodNumber(): number {
        return getWeek(Date.now());
    }

    private static groupByDate<T extends Pull>(pulls: T[]): Map<Date, T[]> {
        const map = new Map<Date, T[]>();

        for (const pull of pulls) {
            const pullTs = pull.gachaTsNumber;

            const date = new Date(pullTs);
            date.setUTCHours(0, 0, 0, 0);

            let list = map.get(date);

            if (!list) {
                list = [];
                map.set(date, list);
            }

            list.push(pull);
        }

        return map;
    }

    private static groupPullsByPeriod<T extends Pull>(groupedPullsByDate: Map<Date, T[]>): Map<number, PeriodPulls<T>> {
        const map = new Map<number, PeriodPulls<T>>();

        for (const [date, pulls] of groupedPullsByDate.entries()) {
            const week = getWeek(date.getTime());
            const weekDay = getDayOfWeekStartsWithMonday(date.getTime());

            let period = map.get(week);
            if (!period) {
                period = PeriodPulls.createEmpty();
                map.set(week, period);
            }

            period[weekDay] = pulls;
        }

        return map;
    }

    private static groupByPeriod(groupedPulls: GroupedPullsByDate): Map<number, GroupedPullsByPeriod> {
        const map = new Map<number, GroupedPullsByPeriod>();

        for (const [bannerType, groupedPullsByDate] of Object.entries(groupedPulls)) {
            const groupedPullsByPeriod = this.groupPullsByPeriod(groupedPullsByDate);

            for (const [week, periodPulls] of groupedPullsByPeriod) {
                let resPulls = map.get(week);
                if (!resPulls) {
                    resPulls = GroupedPullsByPeriod.createEmpty();
                    map.set(week, resPulls);
                }

                resPulls[bannerType as BannerType] = periodPulls as PeriodPulls<CharPull> & PeriodPulls<WeaponPull>;
            }
        }

        return map;
    }

    private static getFirstDayWithPulls<T extends Pull>(periodPulls: PeriodPulls<T>): T[] | null {
        for (let i = 6; i >= 0; i--) {
            const pulls = periodPulls[i as keyof PeriodPulls<T>];

            if (pulls.length > 0) {
                return pulls;
            }
        }

        return null;
    }

    public get periodNumber(): number {
        return this._periodNumber;
    }

    public getId(): StablePullId | null {
        const pulls = StablePullPeriod.getFirstDayWithPulls(this._specialPulls)
            ?? StablePullPeriod.getFirstDayWithPulls(this._weaponPulls)
            ?? StablePullPeriod.getFirstDayWithPulls(this._jointPulls)
            ?? StablePullPeriod.getFirstDayWithPulls(this._standardPulls)
            ?? StablePullPeriod.getFirstDayWithPulls(this._beginnerPulls)
            ?? StablePullPeriod.getFirstDayWithPulls(this._rerunPulls);

        if (!pulls) {
            return null;
        }

        return StablePullId.create(this._periodNumber, pulls);
    }
}