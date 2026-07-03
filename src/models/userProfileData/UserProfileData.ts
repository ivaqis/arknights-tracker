import { GameServerId } from "@models/GameServerId";

export interface UserProfileData {
    base: {
        name: string,
        level: number,
        serverId: GameServerId,
        avatarUrl: string | null
    },
    stats: {
        charCount: number,
        explorationLevel: number,
        weaponCount: number,
        fileCount: number,
        awakeDay: number,
        sanity: number,
        maxSanity: number,
        protoPassLevel: number,
        maxProtoPassLevel: number,
        weeklyRoutineLevel: number,
        maxWeeklyRoutineLevel: number,
        activityPoints: number,
        maxActivityPoints: number
    }
}