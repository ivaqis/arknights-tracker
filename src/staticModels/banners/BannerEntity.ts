export interface BannerEntity {
    id: string,
    name: string,
    type: string,
    dbType: string,
    startTime: string,
    endTime?: string | null,
    startTimeAsia?: string | null,
    endTimeAsia?: string | null,
    featured6: string[]
}