export enum GameServerId {
    EUROPE = "2",
    ASIA = "3"
}

export namespace GameServerId {
    export function isServerId(str: string): str is GameServerId {
        return str === GameServerId.EUROPE || str === GameServerId.ASIA;
    }
}