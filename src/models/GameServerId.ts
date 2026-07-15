export enum GameServerId {
    ASIA = "2",
    EUROPE = "3"
}

export namespace GameServerId {
    export function isServerId(str: string): str is GameServerId {
        return str === GameServerId.EUROPE || str === GameServerId.ASIA;
    }
}