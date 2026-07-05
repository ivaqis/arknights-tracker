export interface ContractData {
    id: string;
    name: string;
    challengeCount: number;
    weeklyMission: {
        count: number;
        total: number;
    };
    indicatorMission: {
        count: number;
        total: number;
    }
    stageMission: {
        count: number;
        total: number;
    };
    startAtTs: string;
    endAtTs: string;
    gameplayEndAtTs: string;
}