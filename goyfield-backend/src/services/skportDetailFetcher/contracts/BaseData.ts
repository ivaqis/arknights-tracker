export interface BaseData {
    serverName: string;
    roleId: string;
    name: string;
    createTime: string;
    saveTime: string;
    lastLoginTime: string;
    exp: number;
    level: number;
    worldLevel: number;
    gender: number;
    avatarUrl: string;
    mainMission: {
        id: string;
        description: string;
    };
    charNum: number;
    weaponNum: number;
    docNum: number;
}